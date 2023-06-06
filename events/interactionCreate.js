const logError = require('../core/logError');

module.exports = {
	name: 'interactionCreate',
  once: false,
  async execute (interaction) {
    if (interaction.isModalSubmit()) {
      try {
        await require(`../interactions/${interaction.customId.split('_')[0]}`).execute(interaction);
      } catch (error) {
        logError(error, interaction.customId);
        let action = "editReply";
        if (['editRole', 'editItem'].includes(interaction.customId.split("_")[0])) action = "reply";
        await interaction[action](`**Um erro ocorreu.** Erro:\n\`\`\`\n${error}\`\`\`\n\nSeu rascunho:\n${interaction.fields.fields.map(field => `${field.customId}: \`${field.value ? field.value : '-'}\``).join('\n')}`);
      }
    } else if (interaction.isStringSelectMenu()) {
      try {
        await require(`../interactions/${interaction.customId}`).execute(interaction);
      } catch (error) {
        logError(error, interaction.customId);
        await interaction.editReply({content: `**Um erro ocorreu.** Erro:\n\`\`\`\n${error}\`\`\``, components: []});
      }
    } else if (interaction.isChatInputCommand()) {
      const command = bot.commands.get(interaction.commandName);

      try {
        await command.execute(interaction);
      } catch (error) {
        logError(error, command.properties.name);
        let action = "editReply";
        if (['ping'].includes(command.properties.name)) action = "reply";
        await interaction[action](`**Um erro ocorreu.** Erro:\n\`\`\`\n${error}\`\`\``);
      }
    } else if (interaction.isButton()) {
      try {
        const buttonsIDs = interaction.customId.split('_');
        await require(`../buttons/${buttonsIDs[0]}`)[buttonsIDs[1]](interaction);
      } catch (error) {
        logError(error, interaction.customId);
        await interaction.editReply(`**Um erro ocorreu.** Erro:\n\`\`\`\n${error}\`\`\``);
      }
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
  
      if (!command) {
        console.error(`Nenhum comando ${interaction.commandName} encontrado.`);
        return;
      }
  
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        logError(error, interaction.commandName);
      }
    } else {
      return;
    }
  }
}