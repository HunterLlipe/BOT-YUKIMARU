const { SlashCommandBuilder } = require('discord.js');

const properties = new SlashCommandBuilder()
  .setName('apagar-dados')
  .setDescription('Apagará seus dados de roll e inventários.')
  .addStringOption((option) =>
    option
      .setName("jogo")
      .setDescription("Simulador que será apagado.")
      .addChoices(
        { name: 'Genshin Impact', value: 'genshin' },
        { name: 'Honkai: Star Rail', value: 'honkai' },
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("confirmação")
      .setDescription("Esse é uma ação irreversível, você tem certeza?")
      .addChoices(
        { name: 'Sim, eu quero apagar meus dados.', value: 'true' },
        { name: 'Não, eu não quero apagar meus dados.', value: 'false' },
      )
      .setRequired(true)
  );

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const game = interaction.options.getString('jogo');
  const confirmation = interaction.options.getString('confirmação');

  if (confirmation == 'false') {
    interaction.editReply({content: 'Seus dados **não foram apagados**.', ephemeral: true});
    return;
  }
  
	const inventory = await xata.db.inventory.read(`${game}_${interaction.user.id}`);

  inventory.delete().then(() => {
    interaction.editReply({content: `Seus dados **foram apagados**.`, ephemeral: true});
  });
}

module.exports = { properties, execute };