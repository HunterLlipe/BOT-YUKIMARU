const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const xata = global.xata;
const { transformItemToEmbed } = require("../core/embedMaker");

async function execute (interaction) {
	await interaction.deferUpdate();
	
	const itemID = interaction.values[0].slice(9);
	const item = await xata.db.items.read(itemID);
	const embed = await transformItemToEmbed(item);

	const buttons = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(`manageItem_edit_${itemID}`)
				.setLabel('Editar')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`manageItem_preview_${itemID}`)
				.setLabel('Pré-Visualizar Roll')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`manageItem_erase_${itemID}`)
				.setLabel('Apagar')
				.setStyle(ButtonStyle.Secondary)
		);

	await interaction.editReply({ content: "**Gerenciar item**", components: [buttons], embeds: [embed] });
}

module.exports = {execute}