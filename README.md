Variáveis de ambiente
```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
CLOUDINARY_TOKEN=
CLOUDINARY_KEY=
XATA_API_KEY=
XATA_BRANCH=main
```

O cliente Xata instalado lê `XATA_BRANCH`; `XATA_FALLBACK_BRANCH` não é lida
por esta versão. Sem branch explícita, o cliente usa `main`.

## Execução e Railway

Use Node.js 22, execute `npm ci` e depois `npm start` na raiz do repositório.
O servidor HTTP usa `PORT` fornecida pela plataforma, ou `3000` localmente,
e escuta em `0.0.0.0`.

No Railway, use Railpack, Root Directory `/`, Build Command sem override
(não há etapa de compilação) e Start Command `npm start`.
Configure `RAILPACK_NODE_VERSION=22` e `NODE_ENV=production`.
A instalação deve usar o lockfile: `RAILPACK_NODE_NPM_INSTALL=npm ci`.
Mantenha uma réplica e desative o modo de suspensão para o bot permanecer conectado.

Configure as cinco credenciais/identificadores listados acima e `XATA_BRANCH=main`
no ambiente production, sem adicionar seus valores ao Git. `DISCORD_CLIENT_ID`
é o ID da aplicação correspondente ao token. No Discord Developer Portal,
habilite Server Members Intent e Message Content Intent, usados pelo código.
Cloudinary mantém o cloud name existente no código; as credenciais precisam
pertencer a essa conta. O banco Xata mantém a URL e o esquema de `xata.js`.

`GET /` confirma apenas que o HTTP responde, não que o Discord está conectado.
Não use essa resposta como prova de funcionamento completo do bot.

Validação offline: `node scripts/validate-deploy.js`. Ela verifica sintaxe,
carregamento dos módulos, schemas dos comandos, canvas/sharp e a configuração
da porta com integrações simuladas. Não testa autenticação nem serviços externos.
O script `npm test` original ainda é um placeholder que retorna erro.

Veja `DEPLOY-AUDIT.md` para evidências, limitações e pendências do deploy.
