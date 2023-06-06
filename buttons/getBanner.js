const xata = global.xata;
const { transformDataToDropdown } = require("../core/dropdownMaker");

async function execute (interaction, page) {
  // converter a mensagem em um objeto com os filtros
  const filtersAsString = interaction.message.content.split("\n").filter(line => !line.startsWith("*"));
  const column = {
    'jogo': 'game',
    'tipo': 'type'
  };
  const filtersAsObject = filtersAsString.map(filter => {
    const [key, value] = filter.split(":").map(part => part.trim());
    return { name: column[key], value: value };
  });

  // fazer o que se faz pro xata funcionar
  const filters = filtersAsObject.filter(option => !['name'].includes(option.name));
  const xataFilter = {page: { size: 200, offset: 0 }};
  if (filters.length > 0) xataFilter.filter = {};
  for (const option of filters) {
    xataFilter.filter[option.name] = option.value;
  }

  const name = (filtersAsObject.find(filter => filter.name === "name"))?.value || null;
  const banners = await xata.db.banners.search(name, xataFilter);

  if (banners.length > 0) {
    const dropdown = transformDataToDropdown(banners, page, 'getBanner', 'Selecionar um banner...');
    await interaction.update({ components: dropdown });
  } else {
    await interaction.editReply('Sem banners para exibir.');
  }
}

async function previousPage (interaction) {
  const currentPage = Number(interaction.customId.split('_')[2]);
  execute(interaction, currentPage - 1);
}

async function nextPage (interaction) {
  const currentPage = Number(interaction.customId.split('_')[2]);
  execute(interaction, currentPage + 1);
}

module.exports = {previousPage, nextPage}