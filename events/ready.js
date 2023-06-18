const { ActivityType } = require('discord.js');

module.exports = {
  name: "ready",
  once: true,
  execute(bot) {
    console.log(`Servidor online e bot respondendo como ${bot.user.tag}.`);

    const yukimaruActivities = [
      {
        activities: [
          {
            name: "Lives do Hunter Llipe",
            type: ActivityType.Streaming,
            url: "https://twitch.tv/hunterllipe",
          },
        ],
        status: "online",
      },
      {
        activities: [
          {
            name: "Hunter Llipe no YouTube",
            type: ActivityType.Watching,
            url: "https://www.youtube.com/hunterllipe",
          },
        ],
        status: "dnd",
      },
      {
        activities: [
          {
            name: "Genshin Impact",
            type: ActivityType.Playing,
          },
        ],
        status: "online",
      }
    ];

    let index = 0;
    setInterval(() => {
      if (index === yukimaruActivities.length) index = 0;

      const presence = yukimaruActivities[index];
			bot.user.setPresence(presence);

      index++;
    }, 18000000);
  }
};