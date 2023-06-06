const xata = global.xata;
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

async function edit (interaction) {
  const roleID = interaction.customId.slice(16);
	const role = await xata.db.roles.read(roleID);

  const roleBuilder = new ModalBuilder()
  .setCustomId('editRole_' + roleID)
  .setTitle('Editar cargo')
  .addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("title")
        .setLabel("Título")
        .setPlaceholder('Título que será enviado no embed do cargo.')
        .setStyle(TextInputStyle.Short)
        .setValue(role.title)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Descrição")
        .setPlaceholder('Descrição que será enviada no embed do cargo.')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(role.description)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("thumbnail")
        .setLabel("Thumbnail")
        .setPlaceholder("Imagem menor que ficará na lateral do embed do cargo.")
        .setStyle(TextInputStyle.Short)
        .setValue(role.thumbnail)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("image")
        .setLabel("Imagem principal")
        .setPlaceholder("Imagem principal que ficará no embed do cargo.")
        .setStyle(TextInputStyle.Short)
        .setValue(role.image)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("color")
        .setLabel("Cor")
        .setPlaceholder('Cor (HEX com # na frente) da lateral do embed. Pode ser gerada com base na thumbnail.')
        .setStyle(TextInputStyle.Short)
        .setValue(role.color)
        .setRequired(false)
    )
  );

  await interaction.showModal(roleBuilder);
}

async function erase (interaction) {
  const roleID = interaction.customId.slice(17);
	const role = await xata.db.roles.read(roleID);

  role.delete().then(() => {
    interaction.update({content: `Cargo **<@&${role.id}>** foi **deletado** do banco de dados, não do Discord.`, embeds: [], components: []})
  })
}

module.exports = {edit, erase}