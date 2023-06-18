const xata = global.xata;
const cloudinary = global.cloudinary;
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const wishCore = require("../core/wish");
const { transformDataToDropdown } = require("../core/dropdownMaker");
const { transformWishToEmbed } = require("../core/embedMaker");

async function dropdownPage (interaction, page) {
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
  const xataFilter = {page: { size: 200, offset: 0 }};
  if (filters.length > 0) xataFilter.filter = {};
  for (const option of filters) {
    xataFilter.filter[option.name] = option.value;
  }

  const name = (filtersAsObject.find(filter => filter.name === "name"))?.value || null;
  const items = await xata.db.items.search(name, xataFilter);

  if (items.length > 0) {
    const dropdown = transformDataToDropdown(items, page, 'manageItem', 'Selecionar um item...');
    await interaction.update({ components: dropdown });
  } else {
    await interaction.editReply('Sem itens para exibir.');
  }
}

async function previousPage (interaction) {
  const currentPage = Number(interaction.customId.split('_')[2]);
  dropdownPage(interaction, currentPage - 1);
}

async function nextPage (interaction) {
  const currentPage = Number(interaction.customId.split('_')[2]);
  dropdownPage(interaction, currentPage + 1);
}

async function edit (interaction) {
  const itemID = interaction.customId.slice(16);
	const item = await xata.db.items.read(itemID);

  const itemBuilder = new ModalBuilder()
  .setCustomId('editItem_' + itemID)
  .setTitle('Editar item')
  .addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Nome em português do item")
        .setStyle(TextInputStyle.Short)
        .setValue(item.name)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("type")
        .setLabel("Tipo")
        .setPlaceholder('Digite "character" para personagem e "weapon" para arma.')
        .setStyle(TextInputStyle.Short)
        .setValue(item.type)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("quality")
        .setLabel("Quantidade de estrelas")
        .setMinLength(1)
        .setMaxLength(1)
        .setPlaceholder("De 1 a 5.")
        .setStyle(TextInputStyle.Short)
        .setValue(item.quality.toString())
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("image")
        .setLabel("Foto")
        .setPlaceholder("Utilize apenas links em PNG, JPG ou JPEG.")
        .setStyle(TextInputStyle.Short)
        .setValue(item.image)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("subtype")
        .setLabel("Tipo da arma ou visão/elemento do personagem.")
        .setPlaceholder('Digite o nome do subtipo em inglês — se tiver mais de um, separe por ;')
        .setStyle(TextInputStyle.Short)
        .setValue(item.subtype2 ? item.subtype + ";" + item.subtype2 : item.subtype)
        .setRequired(true)
    )
  );

  await interaction.showModal(itemBuilder);
}

async function erase (interaction) {
  const itemID = interaction.customId.slice(17);
	const item = await xata.db.items.read(itemID);
  item.delete().then(() => {
    interaction.update({content: `Item **${item.name}** foi **deletado**.`, embeds: [], components: []});
  });
  const photoUrlRegExp = item.image.match(/https:\/\/res\.cloudinary\.com\/.*?\/image\/upload\/v.*?\/(.*?)\./);
  if (photoUrlRegExp) cloudinary.api.delete_resources([photoUrlRegExp[1]]);
}

async function preview (interaction) {
  await interaction.deferReply();
  const itemID = interaction.customId.slice(19);
	const item = await xata.db.items.read(itemID);
  const wish = new Array(10).fill(item);
  const banner = {
    name: item.name,
    game: item.game
  }
  
  // enviar embed e imagem
  const wishResult = new AttachmentBuilder(await wishCore[item.game + 'WishImage'](wish), {name: 'wishResult.png'});
  let embed = await transformWishToEmbed(wish, interaction, banner);
  embed.setImage('attachment://wishResult.png');
  interaction.editReply({ embeds: [embed], files: [wishResult]});
}

module.exports = {previousPage, nextPage, edit, erase, preview}