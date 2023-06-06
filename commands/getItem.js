const { SlashCommandBuilder } = require("discord.js");
const xata = global.xata;
const { transformDataToDropdown } = require("../core/dropdownMaker");

const properties = new SlashCommandBuilder()
  .setName("item")
  .setDescription("Receba uma lista de itens e selecione um para obter mais informações. Use filtros nessa lista.")
  .addStringOption((option) =>
    option
      .setName("jogo")
      .setDescription("Filtre itens pelo jogo.")
      .addChoices(
        { name: "Genshin Impact", value: "genshin" },
        { name: "Honkai: Star Rail", value: "honkai" }
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
  );

async function execute(interaction) {
  await interaction.deferReply();

  const name = interaction.options.getString('nome');
  const options = interaction.options.data;
  const filters = options.filter(option => !['nome'].includes(option.name));
  const xataFilter = {page: { size: 200, offset: 0 }};
  if (filters.length > 0) xataFilter.filter = {};
  const column = {
    'jogo': 'game',
    'tipo': 'type',
    'qualidade': 'quality',
    'subtipo': 'subtype'
  };

  for (const option of filters) {
    xataFilter.filter[column[option.name]] = option.value;
  }

  const items = await xata.db.items.search(name, xataFilter);
  
  if (items.length > 0) {
    const dropdown = transformDataToDropdown(items, 0, 'getItem', 'Selecionar um item...');
    await interaction.editReply({ content: `**__Itens__**\n${options.length > 0 ? "**Filtros**\n" : ""}` + options.map(option => `${option.name}: ${option.value}`).join("\n"), components: dropdown });
  } else {
    await interaction.editReply('Sem itens para listar.');
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