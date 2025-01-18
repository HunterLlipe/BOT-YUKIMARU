const xata = global.xata;
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
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
  const xataFilter = {};
  
  for (const option of filters) {
    xataFilter[option.name] = option.value;
  }

  const name = (filtersAsObject.find(filter => filter.name === "name"))?.value || undefined;
  
  let query = xata.db.banners;
  if (filters.length > 0 || name) query = query.filter({ $all: { name, ...xataFilter } });
  const banners = await query.getAll();

  if (banners.length > 0) {
    const dropdown = transformDataToDropdown(banners, page, 'manageBanner', 'Selecionar um banner...');
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

async function edit (interaction) {
  const bannerID = interaction.customId.slice(18);
	const banner = await xata.db.banners.read(bannerID);

  const generalItems = (await xata.db.items.read(banner.generalItems)).filter(item => item);
  const boostedItems = generalItems.filter(item => banner.boostedItems.includes(item.id));

  const bannerBuilder = new ModalBuilder()
  .setCustomId('editBanner_' + bannerID)
  .setTitle('Editar banner')
  .addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Nome do banner")
        .setStyle(TextInputStyle.Short)
        .setValue(banner.name)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("type")
        .setLabel("Tipo")
        .setPlaceholder('Digite "character" para personagem, "weapon" para arma e "standard" para mochileiro.')
        .setStyle(TextInputStyle.Short)
        .setValue(banner.type)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("command")
        .setLabel("Apelido")
        .setPlaceholder("Nome usado pelos usuários para simular o banner.")
        .setStyle(TextInputStyle.Short)
        .setValue(banner.command)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("generalItems")
        .setLabel("Itens gerais")
        .setPlaceholder("Lista de nomes de itens sem destaque (em português) separados por ; para serem cadastrados")
        .setStyle(TextInputStyle.Paragraph)
        .setValue(generalItems.map(item => item.name).join(';'))
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("boostedItems")
        .setLabel("Itens destacados")
        .setPlaceholder('Lista de nomes de itens com destaque (em português) separados por ; para serem cadastrados')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(boostedItems.map(item => item.name).join(';'))
        .setRequired(false)
    )
  );

  await interaction.showModal(bannerBuilder);
}

async function erase (interaction) {
  const bannerID = interaction.customId.slice(19);
	const banner = await xata.db.banners.read(bannerID);

  banner.delete().then(() => {
    interaction.update({content: `Banner **${banner.name}** foi **deletado**.`, embeds: [], components: []});
  });
}

module.exports = {previousPage, nextPage, edit, erase}