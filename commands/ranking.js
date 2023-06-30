const { SlashCommandBuilder } = require('discord.js');
const bot = global.bot;

const properties = new SlashCommandBuilder()
  .setName('ranking-de-pontos')
  .setDescription('Veja os Hunters com mais pontos!');

async function execute(interaction) {
  await interaction.deferReply();

  const huntersMissions = await xata.db.huntersMissions.sort('points', 'desc').getAll();

  await interaction.editReply('**Ranking de Pontos**\n\n' + (await Promise.all(huntersMissions.map(async (user, index) => `${index < 3 ? '**' : ``}${index + 1}º - ${(await bot.users.fetch(user.id)).username} (${user.points} ${user.points > 1 ? 'pontos' : 'ponto'})${index < 3 ? '**' : ''}`))).join('\n'));
}

module.exports = { properties, execute };