const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Vibrant = require("node-vibrant");
const Mission = require('../core/missionClass');
const xata = global.xata;

const properties = new SlashCommandBuilder()
  .setName('sorte')
  .setDescription('Ganhe um item aleatório do Mundo de Teyvat e saiba a boa/má sorte dele.');

async function execute(interaction) {
  await interaction.deferReply();

  const luckyItemsMission = new Mission(...Object.values(Mission.missions.find(mission => mission.name === 'luckyItems')), interaction.user.id);
  const userMissions = await luckyItemsMission.getMissionsAsObject();
  if (luckyItemsMission.isDone(userMissions)) {
    interaction.editReply('Você já ganhou seu item hoje. Tente novamente amanhã!')
    return;
  }

  const luckyItems = await xata.db.luckyItems.getAll();
  const chosen = Math.floor(Math.random() * luckyItems.length);
  const chosenItem = luckyItems[chosen];
  const palette = await Vibrant.from(chosenItem.image).getPalette();

  const embed = new EmbedBuilder()
    .setTitle(chosenItem.name)
    .setDescription(chosenItem.description)
    .setImage(chosenItem.image)
    .setColor(palette.Vibrant.hex)

  await interaction.editReply({embeds: [embed]});
  luckyItemsMission.markAsDone();
}

module.exports = { properties, execute };