# Auditoria do deploy — 19/11/2026

## Escopo e origem

Repositório HunterLlipe/BOT-YUKIMARU, HEAD
`5f1faa9f13facc5c85250d58ed4a228f04ea50f2`. A pasta inicial estava vazia,
com Git sem commits/remoto. Clone local em `source/`; essa subpasta é apenas
da auditoria, não é o Root Directory recomendado no Railway.
Na auditoria inicial não houve commit, push, publicação, registro de comandos
remoto ou redeploy. A revisão final autorizou um commit local (ver abaixo).
Não houve acesso autenticado ao Railway nem leitura de seus logs.

## A. Diagnóstico

- Manifesto e lockfile têm dependências diretas correspondentes; `npm ci`
  não acusou divergência. Lockfile v3.
- Não havia script start; `main: index.js` já permite fallback do Railpack.
  Portanto a ausência de start não prova a causa do build interrompido.
- HTTP fixo em 3000 era incompatível com uma PORT diferente fornecida pela
  plataforma. É um problema de execução/rede, não de construção da imagem.
- Node estava restrito a 22.13.0. Em 22.16.0, npm emitiu EBADENGINE.
- Falha nativa reproduzida em Windows/Node 22.16.0: canvas 3.1.0 usava
  prebuild-install 7.1.1 e napi-build-utils 1.0.2. O último compara strings
  (`'7' <= '10'` é falso); a seleção da N-API retornou undefined quando
  process.versions.napi era 10. O instalador então tentou compilar e falhou
  por ausência de Cairo/GTK (`cairo.h`). A seleção incorreta é independente
  do sistema operacional; a mensagem de compilação observada é do Windows.
- Isso não comprova a causa do incidente Railway, nem falha em Node 22.13.0
  especificamente. Não foi confirmada a versão usada no deployment.
- Dependências diretas preservadas: canvas 3.1.0, sharp 0.32.6,
  discord.js 14.11.0, entre outras. Há avisos de pacotes deprecated;
  não foi executada atualização geral nem auditoria de vulnerabilidades completa.
- Não há Dockerfile, railway.json, railway.toml ou configuração de builder
  versionada. Railpack detecta o package.json da raiz. Não foi necessário
  introduzir Docker ou configuração adicional para as correções demonstradas.
- Carregadores de comandos/eventos usam caminhos relativos ao diretório atual;
  iniciar na raiz com npm start. Não foram alterados seus comportamentos.
- O SDK Xata lê XATA_BRANCH e exige API key; a variável XATA_FALLBACK_BRANCH
  antes documentada não é lida pelo SDK instalado. O fallback real é main.
- Registro de comandos e login Discord iniciam sem coordenação entre si;
  a rota HTTP pode responder mesmo com Discord indisponível. Falhas de
  credenciais/intenções são de inicialização, não do build.
- Commits mais recentes alteraram recursos e lógica de banners. O commit
  d36a563 mudou engines/jsdom e lockfile; não há evidência de que os commits
  recentes expliquem a falha de aproximadamente um segundo sem logs.

Uma falha tão precoce pode ocorrer no builder, preparação de imagem, acesso
ao código ou plataforma. Essa hipótese permanece aberta; nenhum log Railway
foi inventado ou inferido como se tivesse sido observado.

## B. Correções locais

- package.json: `start: node index.js` e `engines.node: 22.x`.
- package-lock.json: engines sincronizado, prebuild-install 7.1.1 → 7.1.3
  e napi-build-utils 1.0.2 → 2.0.0. A versão 2 converte a versão para número.
  Nenhuma versão de dependência direta foi alterada.
- index.js: `process.env.PORT || 3000`, bind explícito em `0.0.0.0`.
- README.md: execução, variáveis e configuração Railway documentadas.
- scripts/validate-deploy.js: verificação offline reproduzível, sem login,
  sem publicação de comandos e sem chamadas ao banco.

## C. Validação e comandos

Windows x64, Node 22.16.0, npm 10.9.2:

| Comando/verificação | Resultado |
| --- | --- |
| git clone | Primeira tentativa bloqueada por rede do sandbox; repetição autorizada passou |
| npm ci --no-audit --no-fund (original) | Falhou no canvas/N-API; fallback sem Cairo |
| npm ci --ignore-scripts --no-audit --no-fund | 348 pacotes; só inspeção, não validação de build |
| Seleção N-API original em node_modules/canvas | runtime 10; seleção undefined |
| npm update prebuild-install --package-lock-only --ignore-scripts --no-audit --no-fund | Atualizou somente dois pacotes transitivos e engines |
| npm ci --no-audit --no-fund (corrigido, reinstalação limpa) | 348 pacotes instalados, exit 0, scripts nativos habilitados |
| node scripts/validate-deploy.js | Passou: 47 arquivos, módulos diretos/locais, 15 schemas, PNG canvas, resize sharp, PORT/default/bind |
| npm ls --depth=0 | Passou, sem dependências diretas faltantes |
| npm test | Exit 1: placeholder original 'no test specified' |
| git diff --check | Passou |

O primeiro teste offline falhou na limpeza do próprio harness ao destruir
um Client sem login. O harness foi corrigido para EventEmitter e passou.
Node dentro do sandbox retornou EPERM ao resolver arquivos; execução fora
dele passou. Essas restrições locais não são erros atribuídos ao projeto.

Linux/WSL Ubuntu 26.04.1 x86_64, Node 22.16.0 temporário, npm 10.9.2:

- Cópia limpa em `/tmp/yukimaru-check/app`, sem node_modules do Windows.
- `npm ci --no-audit --no-fund --fetch-retries=0 --fetch-timeout=30000`:
  348 pacotes instalados em 5 segundos, exit 0, scripts nativos habilitados.
- `node scripts/validate-deploy.js`: todos os mesmos checks passaram,
  inclusive processamento real com canvas e sharp.
- Tentativas preliminares tiveram acesso negado no sandbox, timeout de
  inicialização da distribuição e erro de expansão do PATH Windows no Bash.
  A tentativa final usou PATH explícito com apenas Node Linux, /usr/bin e /bin.
  O WSL ainda emitiu aviso de timeout ao iniciar, mas os comandos Node/npm
  seguintes concluíram e a validação retornou exit 0.

Docker não está instalado.
Não foi executada uma imagem Railpack/BuildKit; WSL não equivale à imagem Railway.

## D. Configuração proposta para Railway

| Campo | Valor |
| --- | --- |
| Ambiente | production |
| Builder | Railpack |
| Root Directory | / (raiz do repositório GitHub) |
| Build Command | Deixar sem override; não há script build |
| Start Command | npm start |
| RAILPACK_NODE_VERSION | 22 |
| RAILPACK_NODE_NPM_INSTALL | npm ci |
| NODE_ENV | production |
| PORT | Valor fornecido pelo Railway, sem fixar 3000 |
| Réplicas | 1 |
| Suspensão/serverless | Desabilitada para manter conexão do bot |

Variáveis da aplicação: DISCORD_TOKEN, DISCORD_CLIENT_ID, CLOUDINARY_KEY,
CLOUDINARY_TOKEN, XATA_API_KEY e XATA_BRANCH=main (ou branch real existente).
Não há necessidade de publicar HTTP para o gateway Discord funcionar.
Se configurar healthcheck HTTP `/`, ele verifica apenas o processo HTTP.

Fontes consultadas:
- https://railpack.com/languages/node/
- https://docs.railway.com/builds/build-configuration
- Metadados npm e fontes instaladas de prebuild-install/napi-build-utils.

## E. Pendências na plataforma

Confirmar projeto, serviço, branch e SHA do deployment com falha; Root Directory;
builder e versão do Node efetivos; overrides antigos; estado do redeploy já
iniciado; identificação do deployment e logs de preparação/build completos.
Se não houver logs, investigar erro de preparação/plataforma com o suporte
Railway e o deployment ID. Não atribuir o incidente a canvas sem essa evidência.

Depois de autorização para publicar, confirmar build, processo npm start,
conexão Discord e registro dos 15 comandos; intents privilegiadas; credenciais
Cloudinary/Xata; leitura/escrita em ambiente controlado e comandos de imagens,
banners, missões, botões e interações. O teste offline não garante esses fluxos.

## F. Status

PENDENTE DE VALIDAÇÃO NO RAILWAY. Correções verificadas no Windows e Linux/WSL;
integrações externas e implantação real ainda não confirmadas.

## Revisão final para commit — 19/11/2026

- Revisados todos os seis arquivos: cinco arquivos de correção/documentação/
  validação e este relatório. Nenhuma mudança funcional alheia ao deploy,
  credencial, arquivo .env ou node_modules incluído. O bind público é necessário
  para o HTTP da plataforma; a rota `/items` já existia e não foi modificada.
- Repetidos `npm ci --no-audit --no-fund` no Windows e a instalação Linux/WSL
  com `--fetch-retries=0 --fetch-timeout=30000`: ambos passaram, com scripts
  nativos habilitados. O script offline passou em ambos os sistemas novamente.
- `npm ls --all --json` e `git diff --check` passaram. O lockfile corresponde
  ao manifesto, e apenas dois pacotes transitivos mudaram de versão.
  `npm test` permanece um placeholder; não é evidência de regressão.
- `npm audit --json` retornou exit 1 e 35 dependências com alertas:
  5 low, 15 moderate, 12 high e 3 critical. As críticas são form-data,
  proxy-addr e request (transitivas). O lockfile original, consultado com
  `npm audit --package-lock-only --json`, apresentou os mesmos alertas.
  Este commit não corrige o passivo de segurança das dependências.
  Avaliar as atualizações e sua compatibilidade em trabalho específico antes
  de considerar o projeto validado do ponto de vista de segurança.
- Branch original: main, tracking origin/main. Consulta somente leitura
  `git ls-remote --heads origin` confirmou main em 5f1faa9.
  Remoto: https://github.com/HunterLlipe/BOT-YUKIMARU.git.
- Branch do commit local: codex/railway-compatibility.
  A branch ligada ao Railway continua não confirmada: não há vínculo local
  disponível, CLI Railway instalada ou conector Railway nesta sessão.
- Nenhum push, deploy ou alteração de configuração remota foi realizado.
