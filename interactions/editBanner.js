const newData = require('../core/newData');
const { transformBannerToEmbed } = require("../core/embedMaker");

async function execute (interaction) {
  await interaction.deferReply();

  const bannerID = interaction.customId.slice(11);
	const banner = await xata.db.banners.read(bannerID);

  const fields = interaction.fields;
  const name = fields.getTextInputValue('name');
  const type = fields.getTextInputValue('type');
  const command = fields.getTextInputValue('command');
  const generalItemsAsString = fields.getTextInputValue('generalItems');
  const boostedItemsAsString = fields.getTextInputValue('boostedItems');
  const generalItems = generalItemsAsString.split(";");
  const boostedItems = boostedItemsAsString?.split(";") || [];

  try {
    const newBanner = await newData.newBanner(banner.game, name, type, command, generalItems, boostedItems, 'name', banner, 'update');
    const bannerUpdated = await newBanner.banner;
    interaction.message.edit({ embeds: [await transformBannerToEmbed(bannerUpdated)] });
    newBanner.fails = newBanner.fails.filter(item => item);
    interaction.editReply(`Banner **${bannerUpdated.name}** foi **editado**. ${newBanner.fails.length > 0 ? `\n**Falhas:** ${newBanner.fails.join(', ')}` : ''}`);
  } catch(error) {
    throw error;
  }
}

module.exports = { execute }