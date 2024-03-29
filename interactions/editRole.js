const newData = require('../core/newData');
const { transformRoleToEmbed } = require("../core/embedMaker");

async function execute (interaction) {
  const roleID = interaction.customId.slice(9);
	const role = await xata.db.roles.read(roleID);

  const fields = interaction.fields;
  const title = fields.getTextInputValue('title');
  const description = fields.getTextInputValue('description');
  const thumbnail = fields.getTextInputValue('thumbnail');
  const image = fields.getTextInputValue('image');
  const color = fields.getTextInputValue('color');

  try {
    const data = await newData.newRole(role.emoji, role.id, title, description, thumbnail, image, color, role, 'update');
    const embed = transformRoleToEmbed(data);
    interaction.update({ embeds: [embed] });
    
    const channel = await bot.channels.fetch(data.channelID) || await bot.channels.cache.get(data.channelID);
    const message = await channel.messages.fetch(data.messageID) || await channel.messages.cache.get(data.messageID);
    message.edit({embeds: [embed]});
  } catch(error) {
    throw error;
  }
}

module.exports = { execute }