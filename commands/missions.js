const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Mission = require('../core/missionClass');

const properties = new SlashCommandBuilder()
  .setName('missões')
  .setDescription('Ver quantidade de Pontos de Expedições e Expedições pendentes.');

async function execute(interaction) {
  await interaction.deferReply();

  const user = await Mission.prototype.getUser(interaction.user.id.toString());
  const dailyMissions = JSON.parse(user.dailyMissions);
  const weeklyMissions = JSON.parse(user.weeklyMissions);

  const embed = new EmbedBuilder()
    .setTitle('Expedições de ' + interaction.user.username)
    .setDescription(`${interaction.user.username} já tem **${user.points} ${user.points > 1 ? 'Pontos de Expedições' : 'Ponto de Expedições'}**!`)
    .setFields({
        name: 'Diárias',
        value: Mission.missions.filter(mission => mission.recurrence === 'daily').map(mission => {
          const currentMission = new Mission(...Object.values(mission), interaction.user.id);
          return `${currentMission.isDone(dailyMissions) ? '✅' : '❌'} ${currentMission.instructions} (${currentMission.points} ${currentMission.points > 1 ? 'Pontos Hunternários' : 'Ponto Hunternário'})`;
        }).join('\n')
      },
      {
        name: 'Semanais',
        value: Mission.missions.filter(mission => mission.recurrence === 'weekly').map(mission => {
          const currentMission = new Mission(...Object.values(mission), interaction.user.id);
          return `${currentMission.isDone(weeklyMissions) ? '✅' : '❌'} ${currentMission.instructions} (${currentMission.points} ${currentMission.points > 1 ? 'Pontos Hunternários' : 'Ponto Hunternário'})`;
        }).join('\n')
      }
    )
    .setThumbnail(interaction.user.avatarURL())

  await interaction.editReply({embeds: [embed]});
}

module.exports = { properties, execute };