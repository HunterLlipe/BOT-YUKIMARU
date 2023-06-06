const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const xata = global.xata;
const { transformBannerToEmbed } = require("../core/embedMaker");

async function execute (interaction) {
	await interaction.deferUpdate();
	
	const bannerID = interaction.values[0].slice(9);
	const banner = await xata.db.banners.read(bannerID);
	const embed = await transformBannerToEmbed(banner);

	const buttons = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(`manageBanner_edit_${bannerID}`)
				.setLabel('Editar')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`manageBanner_erase_${bannerID}`)
				.setLabel('Apagar')
				.setStyle(ButtonStyle.Secondary)
		);

	await interaction.editReply({ content: "**Gerenciar banner**", components: [buttons], embeds: [embed] });
}

module.exports = {execute}