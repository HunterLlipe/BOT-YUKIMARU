const Mission = require('../core/missionClass');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
    // MISSÃO DE MEMES
    const memesChannels = ['974517284590739456', '959092065831108658', '959092496024084530'];
                        //      memes-gerais,         memes-teyvat,       meme-espacial

    if (memesChannels.includes(message.channelId) && message.attachments.size > 0) {
      const memesMission = new Mission(...Object.values(Mission.missions.find(mission => mission.name === 'sendMemes')), message.author.id);
      memesMission.markAsDone();
    }

    // MISSÃO DE SCREENSHOTS
    const screenshotsChannels = ['957862100775092294', '897933306203602944'];
    
    if (screenshotsChannels.includes(message.channelId) && message.attachments.size > 0) {
      const screenshotsMission = new Mission(...Object.values(Mission.missions.find(mission => mission.name === 'sendScreenshots')), message.author.id);
      screenshotsMission.markAsDone();
    }
  }
};