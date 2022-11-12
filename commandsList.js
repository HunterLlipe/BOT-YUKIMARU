module.exports = [
  {
    name: 'Ping',
    command: '!ping',
    description: 'Teste de conexão do bot.',
    example: '',
    alternative: [],
    args: '',
    admin: false,
    parameters: [ 'message' ],
    function: 'ping',
    modulePath: './commands/_general.js'
  },
  {
    name: 'Simulador de Oração',
    command: '!roll',
    description: 'Faça a simulação de um banner/oração.\n' +
      '\n' +
      '_Usar o comando em um curto espaço de tempo (7 segundos) pode atrapalhar a geração da imagem._',
    example: '!roll arma',
    alternative: [ '!r', '!bofetada', '!desejo', '!summon' ],
    args: '<nome do banner/oração>',
    admin: false,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'roll',
    modulePath: './commands/rolls.js'
  },
  {
    name: 'Lista de Orações',
    command: '!orações-lista',
    description: 'Veja todas os um banners/orações cadastrados no bot.',
    example: '!oração-lista 1_armas',
    alternative: [
      '!oração-list',
      '!oracao-list',
      '!banner-list',
      '!oração-lista',
      '!oracao-lista',
      '!banner-lista',
      '!orações-list',
      '!oracoes-list',
      '!oracoes-lista',
      '!banners-list',
      '!banners-lista',
      '!orações',
      '!oração'
    ],
    args: '[página][_texto para pesquisa]',
    admin: false,
    parameters: [ 'message', 'args',  'disbut', 'wixData' ],
    function: 'list',
    modulePath: './commands/banners.js'
  },
  {
    name: 'Informações de uma Oração',
    command: '!oração-info',
    description: 'Saiba as informações que o bot tem sobre o banner/oração informado.',
    example: '!banner-info arma',
    alternative: [
      '!banner-info',
      '!oracao-info',
      '!banner-informação',
      '!banner-informacao',
      '!oracao-informação',
      '!oracao-informacao',
      '!banner-informaçao',
      '!oracao-informaçao'
    ],
    args: '<nome do banner/oração>',
    admin: false,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'info',
    modulePath: './commands/banners.js'
  },
  {
    name: 'Lista de Itens',
    command: '!itens-lista',
    description: 'Veja todos os itens cadastrados no bot. Você pode informar um número para pesquisar por página e em seguida um texto para filtrar a pesquisa.',
    example: '!itens-lista 1_borla',
    alternative: [
      '!item-list',
      '!item-lista',
      '!items-list',
      '!itens-list',
      '!lista-itens',
      '!lista-item'
    ],
    args: '[página][_texto para pesquisa]',
    admin: false,
    parameters: [ 'message', 'args', 'disbut', 'wixData' ],
    function: 'list',
    modulePath: './commands/items.js'
  },
  {
    name: 'Informações de um Item',
    command: '!item-info',
    description: 'Saiba as informações que o bot tem sobre o item informado.',
    example: '!item-info Shogun Raiden',
    alternative: [
      '!item-informação',
      '!item-informacao',
      '!item-informaçao',
      '!personagem-info',
      '!arma-info',
      '!character-info',
      '!weapon-info',
      '!personagem-informação',
      '!arma-informação',
      '!character-informação',
      '!weapon-informação',
      '!personagem-informacao',
      '!arma-informacao',
      '!character-informacao',
      '!weapon-informacao',
      '!personagem-informaçao',
      '!arma-informaçao',
      '!character-informaçao',
      '!weapon-informaçao'
    ],
    args: '<nome do item>',
    admin: false,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'info',
    modulePath: './commands/items.js'
  },
  {
    name: 'Apagar Dados',
    command: '!limpar-dados',
    description: 'Apagará seus dados de desejos e inventários. É uma ação irreversível.',
    example: '',
    alternative: ['!apagar-dados'],
    args: '',
    admin: false,
    parameters: [ 'message', 'wixData' ],
    function: 'clean',
    modulePath: './commands/rolls.js'
  },
  {
    name: 'Estatísticas do Bot',
    command: '!estatística',
    description: 'Quantidade de vezes que cada comando foi usado.',
    example: '',
    alternative: [ '!estatistica', '!estatísticas', '!estatisticas' ],
    args: '',
    admin: false,
    parameters: [ 'message', 'botStats' ],
    function: 'stats',
    modulePath: './commands/_general.js'
  },
  {
    name: 'Adicionar Cargo na Lista de Cargos',
    command: '!cargo-add',
    description: 'Se você quer que os membros do servidor adicionem este novo cargo cadastrado, não esqueça de enviar `!cargo-list`. Lembrando que você deve sempre adicionar o cargo no Discord antes, caso contrário, o bot não conseguirá achar nenhum cargo.',
    example: '!cargo-add @Membros Legais_🙃',
    alternative: ['!cargo-add2'],
    args: '<@nome do cargo>_<emoji>_[número da lista]',
    admin: true,
    parameters: [ 'message', 'args', 'rolesSettings' ],
    function: 'add',
    modulePath: './commands/rolesAdmin.js'
  },
  {
    name: 'Remover Cargo da Lista de Cargos',
    command: '!cargo-delete',
    description: 'Se você não quer que os membros do servidor adicionem este cargo removido do cadastro, não esqueça de enviar `!cargo-list`. Lembrando que você deve sempre remover o cargo no Discord, caso contrário, ele ainda existirá.',
    example: '!cargo-delete 🙃',
    alternative: ['!cargo-delete2'],
    args: '<emoji>_[número da lista]',
    admin: true,
    parameters: [ 'message', 'args', 'rolesSettings' ],
    function: 'remove',
    modulePath: './commands/rolesAdmin.js'
  },
  {
    name: 'Lista de Cargos',
    command: '!cargo-list',
    description: 'É através deste comando que os usuários serão capazes de pegarem os cargos.',
    example: '',
    alternative: [''],
    args: '[número da lista]',
    admin: true,
    parameters: [ 'message', 'rolesSettings', 'args' ],
    function: 'list',
    modulePath: './commands/rolesAdmin.js'
  },
  {
    name: 'Adicionar Item',
    command: '!item-add',
    description: 'Insira o nome do banner, o tipo dele, a quantidade de estrelas e uma foto do item. \n' +
      '\n' +
      'Dimensões para foto do personagem: 320 x 1024 (ou 118 x 498)\n' +
      'Dimensões para foto da arma: 118 x 498\n' +
      '\n' +
      'As opções para o tipo é `weapon` para arma ou `character` para personagem. Envie tudo anexando uma foto.',
    example: '!item-add Arco do Penhasco Obscuro_weapon_4 (foto anexada)',
    alternative: [],
    args: '<nome do item>_<tipo de item: character|weapon>_<quantidade de estrelas>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'add',
    modulePath: './commands/itemsAdmin.js'
  },
  {
    name: 'Adicionar Oração',
    command: '!banner-add',
    description: 'Insira o nome do banner/oração e, opcionalmente, o tipo dele. Se não informado o tipo do banner, ele funcionará como o banner "Standard". As opções para o tipo é `weapon` para um banner que funciona como o "Arma" ou `character` para um banner que funciona como os de personagem. O comando substituirá o banner atual de mesmo tipo pelo novo.',
    example: '!banner-add Kokomi_character',
    alternative: [ '!oração-add', '!oracao-add' ],
    args: '<nome do banner/oração>_[tipo de banner/oração: character|standard|weapon]',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'add',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Remover Oração',
    command: '!banner-remove',
    description: 'Insira o nome do banner/oração e ele será removido para todos os membros.',
    example: '!banner-remove Mochileiro',
    alternative: [ '!oração-remove', '!oracao-remove' ],
    args: '<nome do banner/oração>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'remove',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Editar um Item',
    command: '!item-edit',
    description: 'Caso alguma informação tenha sido preenchida incorretamente, basta inserir a nova informação ao lado ou anexar uma nova foto.\n' +
      '\n' +
      '**Exemplo**\n' +
      'Para alterar o nome: `!item-edit Arco do Penhasco Obscuro_Blackcliff Warbow`\n' +
      'Para alterar o tipo: `!item-edit Arco do Penhasco Obscuro_weapon`\n' +
      'Para alterar a quantidade de estrelas (ATENÇÃO! NUNCA ALTERE A QUANTIDADE DE ESTRELAS QUANDO UM ITEM JÁ ESTIVER EM UM BANNER, CASO CONTRÁRIO, TERÁ QUE REMOVER ELE DO BANNER E ADICIONAR NOVAMENTE): `!item-edit Arco do Penhasco Obscuro_4`\n' +
      'Para alterar a foto: `!item-edit Arco do Penhasco Obscuro` e anexe uma foto',
    example: '',
    alternative: [],
    args: '<nome atual do item>_<informação a ser trocada>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'edit',
    modulePath: './commands/itemsAdmin.js'
  },
  {
    name: 'Editar um Banner/Oração',
    command: '!banner-edit',
    description: 'Caso alguma informação tenha sido preenchida incorretamente, basta inserir a nova informação. Ao alterar o tipo, o banner/oração antigo será substituído.\n' +
      '\n' +
      '**Exemplo**\n' +
      'Para alterar o nome: `!banner-edit arma_armas`\n' +
      'Para alterar o tipo: `!banner-edit arma_weapon`',
    example: '',
    alternative: [ '!oração-edit', '!oracao-edit' ],
    args: '<nome atual do banner/oração>_<informação a ser trocada>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'edit',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Adicionar Item em um Banner/Oração',
    command: '!banner-item',
    description: 'Insira o nome do banner/oração e o nome do item a ser adicionado. Isso não dará destaque em nenhum item.',
    example: '!banner-item arma_arco do penhasco obscuro',
    alternative: [ '!oração-item', '!oracao-item' ],
    args: '<nome do banner/oração>_<nome do item>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'bannerItem',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Remover Item de um Banner/Oração',
    command: '!banner-item-remove',
    description: 'Insira o nome do banner/oração e o nome do item a ser removido. Caso ele tenha sido destacado, ele também será removido da lista de destaque.',
    example: '!banner-item-remove arma_arco do penhasco obscuro',
    alternative: [ '!oração-item-remove', '!oracao-item-remove' ],
    args: '<nome do banner/oração>_<nome do item>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'bannerItemRemove',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Destaque em um Item de um Banner/Oração',
    command: '!item-destaque',
    description: 'Insira o nome do banner e o nome do item a ser destacado. Caso o item ainda não tenha sido adicionado no banner/oração informado, o bot não aceitará, portanto, cadastre o item antes.',
    example: '!item-destaque arma_arco do penhasco obscuro',
    alternative: [],
    args: '<nome do banner/oração>_<nome do item>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'bannerItemBoost',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Remover Destaque de um Item de um Banner/Oração',
    command: '!item-destaque-remove',
    description: 'Insira o nome do banner/oração e o nome do item que perderá o destaque.',
    example: '!item-destaque-remove arma_arco do penhasco obscuro',
    alternative: [],
    args: '<nome do banner/oração>_<nome do item>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'bannerItemBoostRemove',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Gerador da Lista de Itens em um Banner',
    command: '!banner-generator',
    description: 'Gera todos os comandos com base em uma página do [Fandom](https://genshin-impact.fandom.com/pt-br/wiki/Genshin_Impact_Wiki).',
    example: '!banner-generator comum_https://genshin-impact.fandom.com/pt-br/wiki/Invoca%C3%A7%C3%A3o_do_Mochileiro',
    alternative: [ '!oracao-generator', '!oração-generator' ],
    args: '<nome do banner>_<link para o Fandom>',
    admin: true,
    parameters: [ 'message', 'cleanArgs' ],
    function: 'generator',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Pré-visualizar um Item no Desejo',
    command: '!item-preview',
    description: 'Veja como um item fica na imagem de desejo.',
    example: '!item-preview Lua de Mouun',
    alternative: [],
    args: '<nome do item>',
    admin: true,
    parameters: [ 'message', 'args', 'wixData' ],
    function: 'preview',
    modulePath: './commands/bannersAdmin.js'
  },
  {
    name: 'Repetir mensagem',
    command: '!repete',
    description: 'Peça para o bot repetir alguma coisa que você disse.',
    example: '!repete oi',
    alternative: [],
    args: '<mensagem>',
    admin: true,
    parameters: [ 'message', 'args' ],
    function: 'repeat',
    modulePath: './commands/_general.js'
  },
  {
    name: 'Dados do Banco de Dados',
    command: '!getall',
    description: 'Alguns dados dos comandos do bot.',
    example: '',
    alternative: [],
    args: '',
    admin: true,
    parameters: [ 'message', 'rolesSettings' ],
    function: 'getAll',
    modulePath: './commands/_general.js'
  },
  {
    name: 'Configurar do Banco de Dados',
    command: '!setall',
    description: 'Preencha os dados dos comandos do bot.',
    example: '',
    alternative: [],
    args: '',
    admin: true,
    parameters: [ 'message', 'rolesSettings' ],
    function: 'setAll',
    modulePath: './commands/_general.js'
  },
  {
    name: 'Nova Chave no Banco de Dados',
    command: '!setnew',
    description: 'Adicionar chave/objeto JSON.',
    example: '',
    alternative: [],
    args: '',
    admin: true,
    parameters: [ 'message', 'args', 'rolesSettings' ],
    function: 'setNew',
    modulePath: './commands/_general.js'
  },
  {
    name: 'Ajuda',
    command: '!ajuda',
    description: 'Saiba como usar todos os comandos do bot.',
    example: '!ajuda roll',
    alternative: [ '!help' ],
    args: '[comando]',
    admin: false,
    parameters: [ 'message', 'args', 'command' ],
    function: 'help',
    modulePath: './commands/help.js'
  },
  {
    name: 'Ajuda para Administradores',
    command: '!ajuda-admin',
    description: 'Saiba como usar todos os comandos para administradores do bot.',
    example: '!ajuda-admin item-add',
    alternative: ['!help-admin'],
    args: '[comando]',
    admin: true,
    parameters: [ 'message', 'args', 'command' ],
    function: 'helpAdmin',
    modulePath: './commands/help.js'
  }
]