const xata = global.xata;
const { transformBannerToEmbed } = require("../core/embedMaker");

async function execute (interaction) {
	await interaction.deferUpdate();
	
	const bannerID = interaction.values[0].slice(9);
	const banner = await xata.db.banners.read(bannerID);
	const embed = await transformBannerToEmbed(banner);

	await interaction.editReply({ content: "", components: [], embeds: [embed] });
}

module.exports = {execute}