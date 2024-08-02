const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const lodash = require('lodash');

function transformDataToDropdown (data, page, dropdownID, label = 'Selecionar...') {
  const items = data.map(item => {
    return {
      label: lodash.truncate(item.command || item.name, {'length': 25}), 
      description: lodash.truncate(item.command ? item.name : `${{'genshin': 'Genshin Impact', 'honkai': 'Honkai: Star Rail', 'zzz': 'Zenless Zone Zero'}[item.game]} • ${{'weapon': 'Arma', 'character': 'Personagem'}[item.type]}`, {'length': 50}), 
      value: `optionID_${item.id}`
    }
  });
  const itemsPerPage = lodash.chunk(items, 25);
  if (page >= itemsPerPage.length || page < 0) page = 0;

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(dropdownID)
    .setPlaceholder(`${label} (${items.length})`)
    .addOptions(itemsPerPage[page]);

  const previousPageButton = new ButtonBuilder()
    .setCustomId(`${dropdownID}_previousPage_${page}`)
    .setEmoji('⬅')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page == 0);

  const nextPageButton = new ButtonBuilder()
    .setCustomId(`${dropdownID}_nextPage_${page}`)
    .setEmoji('➡️')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page == itemsPerPage.length - 1);

  return [new ActionRowBuilder().addComponents(dropdown), new ActionRowBuilder().addComponents(previousPageButton, nextPageButton)];
}

module.exports = { transformDataToDropdown };