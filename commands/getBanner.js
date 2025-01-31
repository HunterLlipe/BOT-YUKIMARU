const { SlashCommandBuilder } = require("discord.js");
const xata = global.xata;
const { transformDataToDropdown } = require("../core/dropdownMaker");

const properties = new SlashCommandBuilder()
  .setName("banner")
  .setDescription("Receba uma lista de banners e selecione um para obter mais informações. Use filtros nessa lista.")
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
  );

async function execute(interaction) {
  await interaction.deferReply();

  const name = interaction.options.getString('nome') || undefined;
  const options = interaction.options.data;
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
    const dropdown = transformDataToDropdown(banners, 0, 'getBanner', 'Selecionar um banner...');
    await interaction.editReply({ content: `**__Banners__**\n${options.length > 0 ? "**Filtros**\n" : ""}` + options.map(option => `${option.name}: ${option.value}`).join("\n"), components: dropdown });
  } else {
    await interaction.editReply('Sem banners para listar.');
  }
}

module.exports = { properties, execute };