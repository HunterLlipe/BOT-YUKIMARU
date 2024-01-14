const { SlashCommandBuilder } = require('discord.js');
const { transformRoleToEmbed } = require("../core/embedMaker");
const xata = global.xata;

const properties = new SlashCommandBuilder()
  .setName('cargo')
  .setDescription('Permita que os usuários peguem um cargo.')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addRoleOption((option) =>
    option
      .setName("cargo")
      .setDescription("Cargo a ser enviado.")
      .setRequired(true)
  );

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const role = interaction.options.getRole('cargo');
  const roleID = role.id;
  const roleData = await xata.db.roles.read(roleID);

  if (!roleData) {
    interaction.editReply({ content: 'Este cargo não está cadastrado no banco de dados.', ephemeral: true });
    return;
  }
  
  interaction.editReply({ content: 'Enviando embed do cargo neste canal...', ephemeral: true });
  const channel = interaction.channel;
  const message = await channel.send({embeds: [transformRoleToEmbed(roleData)]});
  roleData.update({ messageID: message.id, channelID: channel.id });
  message.react(roleData.emoji);
}

module.exports = { properties, execute };