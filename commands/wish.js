const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const wishCore = require("../core/wish");
const { transformWishToEmbed } = require("../core/embedMaker");
const xata = global.xata;

const properties = new SlashCommandBuilder()
  .setName('roll')
  .setDescription('Simular uma oração ou passe.')
  .addStringOption((option) =>
    option
      .setName("jogo")
      .setDescription("Jogo que tem o banner desejado.")
      .addChoices(
        { name: 'Genshin Impact', value: 'genshin' },
        { name: 'Honkai: Star Rail', value: 'honkai' },
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("apelido")
      .setDescription("Apelido/comando do banner.")
      .setRequired(true)
  );

// Inventário do usuário
let streakWithout = {
  'character': {
    4: 0,
    5: 0
  },
  'weapon': {
    4: 0,
    5: 0
  },
  'standard': {
    4: 0,
    5: 0
  }
};
let lastStarWasBoosted = {
  'character': {
    4: true,
    5: true
  },
  'weapon': {
    4: true,
    5: true
  },
  'standard': {
    4: true,
    5: true
  }
};
let usageCount = {
  'character': 0,
  'weapon': 0,
  'standard': 0
};

async function execute(interaction) {
  const command = interaction.options.getString('apelido');
  const game = interaction.options.getString('jogo');
  interaction.reply(game === 'genshin' ? 'https://media3.giphy.com/media/LQ9IaEvO55PrR2bgIA/giphy.gif' : 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTQ5YjU2NThiZjE2ODgzMTFjOGE0NTBkZGQyZmY4MzA2MDdlNmNkOSZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/uBEt8qhQ0XbVBP8ftd/giphy.gif');

  let banner = (await xata.db.banners.filter({ command: command.toLowerCase(), game }).getAll())[0];
  if (!banner) throw 'Este banner não existe.';

  const items = (await xata.db.items.read(banner.generalItems)).filter(item => item);
  const boostedItems = items.filter(item => banner.boostedItems.includes(item.id));
  const generalItems = items.filter(item => !banner.boostedItems.includes(item.id));
  banner = {
    ...banner,
    boostedItems,
    generalItems
  };
  
  // atualizar variáveis locais
  let inventory = await xata.db.inventory.read(`${game}_${interaction.user.id}`);
  if (inventory) usageCount = JSON.parse(inventory.usageCount);
  if (inventory) streakWithout = JSON.parse(inventory.streakWithout);
  if (inventory) lastStarWasBoosted = JSON.parse(inventory.lastStarWasBoosted);

  const { wish } = wishCore.wishTenItemsAndSort(banner, streakWithout, lastStarWasBoosted);
  if (wish.find(item => item.quality === 5)) interaction.editReply(game === 'genshin' ? 'https://media3.giphy.com/media/orSLaW9ZelYrsi1aWy/giphy.gif' : 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmZlMjRjYWRiOTkwZTRiMGViMWNkODU2ZThiMzJkN2U5YjNkZDEwYiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/YuyimGNT4ZBV5qIBgm/giphy-downsized-large.gif');

  // atualizar banco de dados
  usageCount[banner.type] += 10;
  inventory = await xata.db.inventory.createOrReplace(`${game}_${interaction.user.id}`, { 
    lastStarWasBoosted: JSON.stringify(lastStarWasBoosted), 
    streakWithout: JSON.stringify(streakWithout), 
    usageCount: JSON.stringify(usageCount) 
  });

  // enviar embed e imagem
  const wishResult = new AttachmentBuilder(await wishCore[game + 'WishImage'](wish), {name: 'wishResult.png'});
  let embed = await transformWishToEmbed(wish, interaction, banner, inventory);
  embed.setImage('attachment://wishResult.png');
  interaction.editReply({content: '', embeds: [embed], files: [wishResult]})
}

module.exports = { properties, execute };