const newData = require('../core/newData');

async function execute (interaction) {
  await interaction.deferReply();
  await newData.newItem();
}

module.exports = {execute}