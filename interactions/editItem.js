const newData = require('../core/newData');
const { transformItemToEmbed } = require("../core/embedMaker");

async function execute (interaction) {
  const itemID = interaction.customId.slice(9);
	const item = await xata.db.items.read(itemID);

  const fields = interaction.fields;
  const name = fields.getTextInputValue('name');
  const type = fields.getTextInputValue('type');
  const quality = fields.getTextInputValue('quality');
  const image = fields.getTextInputValue('image');
  const subtype = fields.getTextInputValue('subtype');

  try {
    const data = await newData.newItem(item.game, name, type, quality, image, subtype, item.englishName, item, 'update');
    interaction.update({ embeds: [await transformItemToEmbed(data)] });
  } catch(error) {
    throw error;
  }
}

module.exports = { execute }