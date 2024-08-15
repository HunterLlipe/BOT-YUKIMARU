const { SlashCommandBuilder } = require("discord.js");
const newData = require("../core/newData");
const cloudinary = global.cloudinary;
const { transformItemToEmbed, transformBannerToEmbed } = require("../core/embedMaker");

const properties = new SlashCommandBuilder()
  .setName("novo")
  .setDescription("Cadastrar um novo item ou banner no banco de dados.")
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("item")
      .setDescription("Cadastrar um novo item no banco de dados.")
      .addStringOption((option) =>
        option
          .setName("jogo")
          .setDescription("Jogo em que o item está.")
          .addChoices(
            { name: "Genshin Impact", value: "genshin" },
            { name: "Honkai: Star Rail", value: "honkai" },
            { name: "Zenless Zone Zero", value: "zzz" }
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("nome")
          .setDescription("Nome em português do item.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("nome_em_inglês")
          .setDescription("Nome em inglês do item.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("tipo")
          .setDescription("Tipo do item.")
          .addChoices(
            { name: "Personagem", value: "character" },
            { name: "Arma", value: "weapon" }
          )
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("qualidade")
          .setDescription("Quantidade de estrelas do item.")
          .setMinValue(1)
          .setMaxValue(5)
          .setRequired(true)
      )
      .addAttachmentOption((option) =>
        option
          .setName("foto")
          .setDescription(
            "Utilize apenas PNG, JPG ou JPEG. Se você enviar outro arquivo, o sistema de gacha vai bugar!"
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("subtipo")
          .setDescription("Tipo da arma ou visão/elemento do personagem.")
          .setAutocomplete(true)
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("subtipo2")
          .setDescription("Tipo da arma ou visão/elemento do personagem.")
          .addChoices(
            {
              name: "A Destruição",
              value: "the destruction"
            },
            {
              name: "A Caça",
              value: "the hunt"
            },
            {
              name: "A Erudição",
              value: "the erudition"
            },
            {
              name: "A Harmonia",
              value: "the harmony"
            },
            {
              name: "A Inexistência",
              value: "the nihility"
            },
            {
              name: "A Preservação",
              value: "the preservation"
            },
            {
              name: "A Abundância",
              value: "the abundance"
            }
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("banner")
      .setDescription("Cadastrar um novo banner no banco de dados.")
      .addStringOption((option) =>
        option
          .setName("jogo")
          .setDescription("Jogo em que o item está.")
          .addChoices(
            { name: "Genshin Impact", value: "genshin" },
            { name: "Honkai: Star Rail", value: "honkai" },
            { name: "Zenless Zone Zero", value: "zzz" }
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("nome")
          .setDescription("Nome em português do banner.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("tipo")
          .setDescription("Tipo do banner.")
          .addChoices(
            { name: "Personagem", value: "character" },
            { name: "Arma", value: "weapon" },
            { name: "Mochileiro", value: "standard" }
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("apelido")
          .setDescription("Nome usado pelos usuários para simular o banner.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("gerais")
          .setDescription(
            "Envie uma lista de nomes de itens sem destaque (em português) separados por ; para serem cadastrados"
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("destaque")
          .setDescription(
            "Envie uma lista de nomes de itens com destaque (em português) separados por ; para serem cadastrados"
          )
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("cargo")
      .setDescription("Cadastrar um novo cargo no banco de dados.")
      .addStringOption((option) =>
        option
          .setName("emoji")
          .setDescription("Emoji que será vinculado ao cargo.")
          .setRequired(true)
      )
      .addRoleOption((option) =>
        option
          .setName("cargo")
          .setDescription("Cargo a ser cadastrado.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("título")
          .setDescription("Título que será enviado no embed do cargo.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("descrição")
          .setDescription("Descrição que será enviada no embed do cargo.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("thumbnail")
          .setDescription("Imagem menor que ficará na lateral do embed do cargo.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("imagem")
          .setDescription("Imagem principal que ficará no embed do cargo.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("cor")
          .setDescription("Cor (HEX com # na frente) da lateral do embed. Pode ser gerada com base na thumbnail.")
      )
  );

async function execute(interaction) {
  const chosenCommand = interaction.options.getSubcommand();

  if (chosenCommand === "item") {
    await interaction.deferReply();

    const game = interaction.options.getString("jogo");
    const name = interaction.options.getString("nome");
    const type = interaction.options.getString("tipo");
    const quality = interaction.options.getInteger("qualidade");
    const subtype = interaction.options.getString("subtipo");
    const subtype2 = interaction.options.getString("subtipo2");
    const englishName = interaction.options.getString("nome_em_inglês");

    const discordImage = interaction.options.getAttachment("foto");
    const imageUpload = await cloudinary.uploader.upload(discordImage.url);
    const image = imageUpload.secure_url;

    const item = await newData.newItem(game, name, englishName, type, quality, image, subtype, subtype2);
    interaction.editReply({
      embeds: [await transformItemToEmbed(item)],
    });
  } else if (chosenCommand === "banner") {
    await interaction.deferReply();
  
    const game = interaction.options.getString('jogo');
    const name = interaction.options.getString('nome');
    const type = interaction.options.getString('tipo');
    const command = interaction.options.getString('apelido');
    const generalItemsAsString = interaction.options.getString('gerais');
    const boostedItemsAsString = interaction.options.getString('destaque');
    const generalItems = generalItemsAsString.split(";");
    const boostedItems = boostedItemsAsString?.split(";") || [];
    
    const newBanner = await newData.newBanner(game, name, type, command, generalItems, boostedItems);
    const banner = await newBanner.banner;

    interaction.editReply({
      content: newBanner.fails.length > 0 ? `**Falhas:** ${newBanner.fails.join(', ')}` : '',
      embeds: [await transformBannerToEmbed(banner)]
    });
  } else if (chosenCommand === "cargo") {
    await interaction.deferReply();

    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('cargo');
    const title = interaction.options.getString('título');
    const description = interaction.options.getString('descrição');
    const thumbnail = interaction.options.getString('thumbnail');
    const image = interaction.options.getString('imagem');
    const color = interaction.options.getString('cor');
    
    const newRole = await newData.newRole(emoji, role.id, title, description, thumbnail, image, color);

    interaction.editReply(`O cargo **<@&${newRole.id}>** foi vinculado com sucesso ao emoji ${newRole.emoji}. Use o comando \`/cargo\` para permitir que os usuários peguem o cargo.`);
  }
}

async function autocomplete(interaction) {
  // arguments
  const game = interaction.options.getString('jogo');
  const type = interaction.options.getString('tipo');
  const focusedValue = interaction.options.getFocused();
  
  // choices
  const choices = [
    {
      name: "Anemo",
      value: "anemo",
      game: "genshin",
      type: "character"
    },
    {
      name: "Geo",
      value: "geo",
      game: "genshin",
      type: "character"
    },
    {
      name: "Electro",
      value: "electro",
      game: "genshin",
      type: "character"
    },
    {
      name: "Dendro",
      value: "dendro",
      game: "genshin",
      type: "character"
    },
    {
      name: "Hydro",
      value: "hydro",
      game: "genshin",
      type: "character"
    },
    {
      name: "Pyro",
      value: "pyro",
      game: "genshin",
      type: "character"
    },
    {
      name: "Cryo",
      value: "cryo",
      game: "genshin",
      type: "character"
    },
    {
      name: "Espada",
      value: "sword",
      game: "genshin",
      type: "weapon"
    },
    {
      name: "Espadão",
      value: "claymore",
      game: "genshin",
      type: "weapon"
    },
    {
      name: "Lança",
      value: "polearm",
      game: "genshin",
      type: "weapon"
    },
    {
      name: "Catalisador",
      value: "catalyst",
      game: "genshin",
      type: "weapon"
    },
    {
      name: "Arco",
      value: "bow",
      game: "genshin",
      type: "weapon"
    },
    {
      name: "Físico",
      value: "physical",
      game: "honkai",
      type: "character"
    },
    {
      name: "Fogo",
      value: "fire",
      game: "honkai",
      type: "character"
    },
    {
      name: "Gelo",
      value: "ice",
      game: "honkai",
      type: "character"
    },
    {
      name: "Raio",
      value: "lightning",
      game: "honkai",
      type: "character"
    },
    {
      name: "Vento",
      value: "wind",
      game: "honkai",
      type: "character"
    },
    {
      name: "Quântico",
      value: "quantum",
      game: "honkai",
      type: "character"
    },
    {
      name: "Imaginário",
      value: "imaginary",
      game: "honkai",
      type: "character"
    },
    {
      name: "A Destruição",
      value: "the destruction",
      game: "honkai",
      type: "weapon"
    },
    {
      name: "A Caça",
      value: "the hunt",
      game: "honkai",
      type: "weapon"
    },
    {
      name: "A Erudição",
      value: "the erudition",
      game: "honkai",
      type: "weapon"
    },
    {
      name: "A Harmonia",
      value: "the harmony",
      game: "honkai",
      type: "weapon"
    },
    {
      name: "A Inexistência",
      value: "the nihility",
      game: "honkai",
      type: "weapon"
    },
    {
      name: "A Preservação",
      value: "the preservation",
      game: "honkai",
      type: "weapon"
    },
    {
      name: "A Abundância",
      value: "the abundance",
      game: "honkai",
      type: "weapon"
    },
    {
      name: "Ataque",
      value: "attack",
      game: "zzz",
      type: "character"
    },
    {
      name: "Atordoar",
      value: "stun",
      game: "zzz",
      type: "character"
    },
    {
      name: "Anomalia",
      value: "anomaly",
      game: "zzz",
      type: "character"
    },
    {
      name: "Suporte",
      value: "support",
      game: "zzz",
      type: "character"
    },
    {
      name: "Defesa",
      value: "defense",
      game: "zzz",
      type: "character"
    },
    {
      name: "Ataque",
      value: "attack",
      game: "zzz",
      type: "weapon"
    },
    {
      name: "Atordoar",
      value: "stun",
      game: "zzz",
      type: "weapon"
    },
    {
      name: "Anomalia",
      value: "anomaly",
      game: "zzz",
      type: "weapon"
    },
    {
      name: "Suporte",
      value: "support",
      game: "zzz",
      type: "weapon"
    },
    {
      name: "Defesa",
      value: "defense",
      game: "zzz",
      type: "weapon"
    },
    {
      name: "Fogo",
      value: "fire",
      game: "zzz",
      type: "character"
    },
    {
      name: "Elétrico",
      value: "electric",
      game: "zzz",
      type: "character"
    },
    {
      name: "Gelo",
      value: "ice",
      game: "zzz",
      type: "character"
    },
    {
      name: "Físico",
      value: "physical",
      game: "zzz",
      type: "character"
    },
    {
      name: "Éter",
      value: "ether",
      game: "zzz",
      type: "character"
    },
    {
      name: "Batida",
      value: "strike",
      game: "zzz",
      type: "character"
    }
  ];
  let filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()));
  if (game) filtered = filtered.filter(choice => choice.game === game);
  if (type) filtered = filtered.filter(choice => choice.type === type);
  
  await interaction.respond(
    filtered.slice(0, 25)
  );
}


module.exports = { properties, execute, autocomplete };