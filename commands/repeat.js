const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const properties = new SlashCommandBuilder()
  .setName('repetir')
  .setDescription('Faça o bot repetir um texto, arquivo ou embed.')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
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
  let text = interaction.options.getString('texto');
  const file = interaction.options.getAttachment('arquivo');
  const isEmbed = file?.name.toLowerCase().endsWith(".json");
  const attachment = isEmbed ? (await axios.get(file.url)).data : {files: [file]}
  
  if (!text && !file) {
    interaction.reply({ content: 'Você não mandou nada para repetir!', ephemeral: true });
    return;
  }
  
  if (text) text = text.replace(/\\n/g, '\n');
  interaction.reply({ content: 'Repetindo mensagem...', ephemeral: true });
  const channel = interaction.channel;
  channel.send(file ? { content: text, ...attachment } : { content: text }); //, embeds: [embed]
}

module.exports = { properties, execute };