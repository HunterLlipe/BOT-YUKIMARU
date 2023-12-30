const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Mission = require('../core/missionClass');
const { DateTime } = require("luxon");
const wishCore = require("../core/wish");
const { transformWishToEmbed } = require("../core/embedMaker");
const xata = global.xata;
const bot = global.bot;
const cooldowns = bot.cooldowns;

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

  if (game === 'honkai' && interaction.channelId == '844220451785146439') {
    interaction.reply({content: 'Ei, não simule passes de Honkai: Star Rail neste canal!', ephemeral: true});
    return;
  }

  if (game === 'genshin' && interaction.channelId == '1116458669895340173') {
    interaction.reply({content: 'Ei, não simule passes de Genshin Impact neste canal!', ephemeral: true});
    return;
  }

  await interaction.reply(game === 'genshin' ? 'https://media3.giphy.com/media/LQ9IaEvO55PrR2bgIA/giphy.gif' : 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTQ5YjU2NThiZjE2ODgzMTFjOGE0NTBkZGQyZmY4MzA2MDdlNmNkOSZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/uBEt8qhQ0XbVBP8ftd/giphy.gif');

  let banner = (await xata.db.banners.search(command.toLowerCase(), {
      target: ['name', 'command'],
      filter: {game}
    }))[0];

  if (!banner) {
    interaction.editReply({content: 'Este banner não existe.', attachments: [], files: []});

    const timestamps = cooldowns.get('roll');
    timestamps.delete(interaction.user.id);
    
    return;
  }

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
  interaction.editReply({content: '', embeds: [embed], files: [wishResult]});

  const wishMission = new Mission(...Object.values(Mission.missions.find(mission => mission.name === 'makeAWish')), interaction.user.id);
  await wishMission.markAsDone();
  
  const sevenWishesMission = new Mission(...Object.values(Mission.missions.find(mission => mission.name === 'make7Wishes')), interaction.user.id);
  const userMissions = await sevenWishesMission.getMissionsAsObject();

  if (!sevenWishesMission.isDone(userMissions)) {
    const sevenWishesMissionProgress = await sevenWishesMission.getProgress() || [];
    const currentDate = DateTime.now().setZone('America/Sao_Paulo');
    let filteredWeekProgress = sevenWishesMissionProgress.filter(date => DateTime.fromISO(date).weekNumber === currentDate.weekNumber);

    if (sevenWishesMissionProgress.length < 6) {
      filteredWeekProgress.push(currentDate.toISO());
      await sevenWishesMission.setProgress(filteredWeekProgress);
    } else {
      await sevenWishesMission.markAsDone();
      sevenWishesMission.setProgress([]);
    }
  }
}

module.exports = { cooldown: 7, properties, execute };