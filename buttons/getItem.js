const xata = global.xata;
const { transformDataToDropdown } = require("../core/dropdownMaker");

async function execute (interaction, page) {
  // converter a mensagem em um objeto com os filtros
  const filtersAsString = interaction.message.content.split("\n").filter(line => !line.startsWith("*"));
  const column = {
    'jogo': 'game',
    'nome': 'name',
    'tipo': 'type',
    'qualidade': 'quality',
    'subtipo': 'subtype'
  };
  const filtersAsObject = filtersAsString.map(filter => {
    const [key, value] = filter.split(":").map(part => part.trim());
    return { name: column[key], value: key === "qualidade" ? parseInt(value) : value };
  });

  // fazer o que se faz pro xata funcionar
  const filters = filtersAsObject.filter(option => !['name'].includes(option.name));
  const xataFilter = {};
  
  for (const option of filters) {
    xataFilter[option.name] = option.value;
  }

  const name = (filtersAsObject.find(filter => filter.name === "name"))?.value || undefined;
  
  let query = xata.db.items;
  if (filters.length > 0 || name) query = query.filter({ $all: { name, ...xataFilter } });
  const items = await query.getAll();

  if (items.length > 0) {
    const dropdown = transformDataToDropdown(items, page, 'getItem', 'Selecionar um item...');
    await interaction.update({ components: dropdown });
  } else {
    await interaction.editReply('Sem itens para exibir.');
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