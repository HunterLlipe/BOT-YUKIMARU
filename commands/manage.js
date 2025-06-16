const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const xata = global.xata;
const { transformDataToDropdown } = require("../core/dropdownMaker");
const { transformRoleToEmbed } = require("../core/embedMaker");

const properties = new SlashCommandBuilder()
  .setName("gerenciar")
  .setDescription("Gerenciar um item ou banner do banco de dados.")
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("item")
      .setDescription("Editar ou apagar um item do banco de dados.")
      .addStringOption((option) =>
        option
          .setName("jogo")
          .setDescription("Filtre itens pelo jogo.")
          .addChoices(
            { name: "Genshin Impact", value: "genshin" },
            { name: "Honkai: Star Rail", value: "honkai" },
            { name: "Zenless Zone Zero", value: "zzz" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("nome")
          .setDescription("Filtre itens pelo nome em português do item.")
      )
      .addStringOption((option) =>
        option
          .setName("tipo")
          .setDescription("Filtre itens pelo tipo.")
          .addChoices(
            { name: "Personagem", value: "character" },
            { name: "Arma", value: "weapon" }
          )
      )
      .addIntegerOption((option) =>
        option
          .setName("qualidade")
          .setDescription("Filtre itens pela quantidade de estrelas.")
          .setMinValue(1)
          .setMaxValue(5)
      )
      .addStringOption((option) =>
        option
          .setName("subtipo")
          .setDescription("Filtre itens pelo tipo de arma ou visão/elemento de personagem.")
          .setAutocomplete(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("banner")
      .setDescription("Editar ou apagar um banner do banco de dados.")
      .addStringOption((option) =>
        option
          .setName("jogo")
          .setDescription("Jogo em que o banner está.")
          .addChoices(
            { name: "Genshin Impact", value: "genshin" },
            { name: "Honkai: Star Rail", value: "honkai" },
            { name: "Zenless Zone Zero", value: "zzz" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("nome")
          .setDescription("Filtre banners pelo nome.")
      )
      .addStringOption((option) =>
        option
          .setName("tipo")
          .setDescription("Filtre banners pelo tipo.")
          .addChoices(
            { name: "Personagem", value: "character" },
            { name: "Arma", value: "weapon" },
            { name: "Mochileiro", value: "standard" },
            { name: "Registro de Oração", value: "chronicled" }
          )
      )
    )
  .addSubcommand((subcommand) =>
  subcommand
    .setName("cargo")
    .setDescription("Editar ou apagar um cargo do banco de dados.")
    .addRoleOption((option) =>
      option
        .setName("cargo")
        .setDescription("Cargo a ser gerenciado.")
        .setRequired(true)
    )
  );

async function execute(interaction) {
  const chosenCommand = interaction.options.getSubcommand();

  if (chosenCommand === "item") {
    await interaction.deferReply();
    
    const name = interaction.options.getString('nome') || undefined;
    const options = interaction.options.data[0].options;
    const filters = options.filter(option => !['nome'].includes(option.name));
    const xataFilter = {};
    
    const column = {
      'jogo': 'game',
      'tipo': 'type',
      'qualidade': 'quality',
      'subtipo': 'subtype'
    };
  
    for (const option of filters) {
      xataFilter[column[option.name]] = option.value;
    }

    let query = xata.db.items;
    if (filters.length > 0 || name) query = query.filter({ $all: { name, ...xataFilter } });
    const items = await query.getAll();
    
    if (items.length > 0) {
      const dropdown = transformDataToDropdown(items, 0, 'manageItem', 'Selecionar um item...');
      await interaction.editReply({ content: `**__Itens__**\n${options.length > 0 ? "**Filtros**\n" : ""}` + options.map(option => `${option.name}: ${option.value}`).join("\n"), components: dropdown });
    } else {
      await interaction.editReply('Sem itens para listar.');
    }
  } else if (chosenCommand === "banner") {
    await interaction.deferReply();

    const name = interaction.options.getString('nome') || undefined;
    const options = interaction.options.data[0].options;
    const filters = options.filter(option => !['nome'].includes(option.name));
    const xataFilter = {};
    
    const column = {
      'jogo': 'game',
      'tipo': 'type'
    };
  
    for (const option of filters) {
      xataFilter[column[option.name]] = option.value;
    }
  
    let query = xata.db.banners;
    if (filters.length > 0 || name) query = query.filter({ $all: { name, ...xataFilter } });
    const banners = await query.getAll();
    
    if (banners.length > 0) {
      const dropdown = transformDataToDropdown(banners, 0, 'manageBanner', 'Selecionar um banner...');
      await interaction.editReply({ content: `**__Banners__**\n${options.length > 0 ? "**Filtros**\n" : ""}` + options.map(option => `${option.name}: ${option.value}`).join("\n"), components: dropdown });
    } else {
      await interaction.editReply('Sem banners para listar.');
    }
  } else if (chosenCommand === "cargo") {
    await interaction.deferReply();
    
    const role = interaction.options.getRole('cargo');
    const roleID = role.id;
    const roleData = await xata.db.roles.read(roleID);
    if (!roleData) {
      interaction.editReply('Este cargo não está cadastrado no banco de dados.');
      return;
    }

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manageRole_edit_${roleID}`)
          .setLabel('Editar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`manageRole_erase_${roleID}`)
          .setLabel('Apagar do Bot')
          .setStyle(ButtonStyle.Secondary)
      );
    
    interaction.editReply({embeds: [transformRoleToEmbed(roleData)], components: [buttons] })
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
      name: "A Recordação",
      value: "remembrance",
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
      name: "Destruidor",
      value: "rupture",
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
      name: "Sépia",
      value: "auric ink",
      game: "zzz",
      type: "character"
    },
    {
      name: "Geada",
      value: "frost",
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