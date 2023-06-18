const logError = require('../core/logError');
const bot = global.bot;
const cooldowns = bot.cooldowns;
const { Collection } = require('discord.js');

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
        await interaction.editReply({content: `**Um erro ocorreu.** Erro:\n\`\`\`\n${error}\`\`\``, components: [], embeds: []});
      }
    } else if (interaction.isChatInputCommand()) {
      const command = bot.commands.get(interaction.commandName);
      const commandName = command.properties.name;

      if (command.cooldown) {
        // se pedir roll de honkai, aumenta pra 15
        const game = interaction.options.getString('jogo');
        const commandIsHonkaiRoll = game === 'honkai' && commandName === 'roll';

        if (!cooldowns.has(commandName)) {
          cooldowns.set(commandName, new Collection());
        }
        
        const now = Date.now();
        const timestamps = cooldowns.get(commandName);
        const cooldownAmount = commandIsHonkaiRoll ? 15000 : command.cooldown * 1000;
        
        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        
          if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return interaction.reply({ content: `**Calma.** Você pode usar este comando novamente <t:${expiredTimestamp}:R>.`, ephemeral: true });
          }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        logError(error, commandName);
        let action = "editReply";
        if (['ping'].includes(commandName)) action = "reply";
        await interaction[action]({content: `**Um erro ocorreu.** Erro:\n\`\`\`\n${error}\`\`\``, components: [], embeds: []});
      }
    } else if (interaction.isButton()) {
      try {
        const buttonsIDs = interaction.customId.split('_');
        await require(`../buttons/${buttonsIDs[0]}`)[buttonsIDs[1]](interaction);
      } catch (error) {
        logError(error, interaction.customId);
        await interaction.editReply({content: `**Um erro ocorreu.** Erro:\n\`\`\`\n${error}\`\`\``, components: [], embeds: []});
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