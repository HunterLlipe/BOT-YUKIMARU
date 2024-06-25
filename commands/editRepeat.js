const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');

const properties = new SlashCommandBuilder()
  .setName('editar-repetir')
  .setDescription('Faça o bot editar uma mensagem que ele repetiu.')
  .setDMPermission(false)
  .addStringOption((option) =>
    option
      .setName("link")
      .setDescription("Link da mensagem a ser editada.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("texto")
      .setDescription("Repetir um texto.")
  )
  .addAttachmentOption((option) =>
    option
      .setName("arquivo")
      .setDescription("Repetir um arquivo ou embed (qualquer .json)")
  );

async function execute(interaction) {
  const hunterEditorRoleID = '946917051535097886';
  if (!interaction.member.roles.cache.has(hunterEditorRoleID) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
    return;
  } 

  const messageID = interaction.options.getString('link').split('/').at(-1);
  const channelID = interaction.options.getString('link').split('/').at(-2);
  let text = interaction.options.getString('texto');
  const file = interaction.options.getAttachment('arquivo');
  const isEmbed = file?.name.toLowerCase().endsWith(".json");
  const attachment = isEmbed ? (await axios.get(file.url)).data : {files: [file]}
  
  if (!text && !file) {
    interaction.reply({ content: 'Você não mandou nada para editar!', ephemeral: true });
    return;
  }
  
  if (text) text = text.replace(/\\n/g, '\n');
  await interaction.reply({ content: 'Editando mensagem...', ephemeral: true });
  const channel = await bot.channels.fetch(channelID) || await bot.channels.cache.get(channelID);
  try {
    const message = await channel.messages.fetch(messageID) || await channel.messages.cache.get(messageID);
    await message.edit(file ? isEmbed ? { content: text, ...attachment, files: [] } : { content: text, ...attachment, embeds: [] } : { content: text, files: [], embeds: [] });
    await interaction.editReply({ content: 'Mensagem editada.', ephemeral: true });
  } catch (error) {
    throw error;
  }
}

module.exports = { properties, execute };