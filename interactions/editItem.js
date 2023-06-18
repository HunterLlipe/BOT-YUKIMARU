const newData = require('../core/newData');
const { transformItemToEmbed } = require("../core/embedMaker");

async function execute (interaction) {
  const itemID = interaction.customId.slice(9);
	const item = await xata.db.items.read(itemID);

  const fields = interaction.fields;
  const name = fields.getTextInputValue('name');
  const type = fields.getTextInputValue('type');
  const quality = fields.getTextInputValue('quality');
  const subtypes = fields.getTextInputValue('subtype').split(';');

  const discordImage = fields.getTextInputValue('image');
  let image = discordImage;
  if (!discordImage.startsWith('https://res.cloudinary.com/duwng4tki/image/upload')) {
    const imageUpload = await cloudinary.uploader.upload(discordImage);
    image = imageUpload.secure_url;
  }

  try {
    const data = await newData.newItem(item.game, name, item.englishName, type, quality, image, subtypes[0], subtypes[1], item, 'update');
    interaction.update({ embeds: [await transformItemToEmbed(data)] });
  } catch(error) {
    throw error;
  }
}

module.exports = { execute }