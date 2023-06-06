const xata = global.xata;
const { transformItemToEmbed } = require("../core/embedMaker");

async function execute (interaction) {
	await interaction.deferUpdate();
	
	const itemID = interaction.values[0].slice(9);
	const item = await xata.db.items.read(itemID);
	const embed = await transformItemToEmbed(item);

	await interaction.editReply({ content: "", components: [], embeds: [embed] });
}

module.exports = {execute}