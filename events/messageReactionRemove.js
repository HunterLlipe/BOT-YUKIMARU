const logError = require('../core/logError');
const bot = global.bot;
const xata = global.xata;

module.exports = {
	name: 'messageReactionRemove',
	once: false,
	async execute(reaction, user) {
    // se a reação é do bot, acabe a função aqui
    if (user.id === bot.user.id) return;

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
      // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
      try {
        await reaction.fetch();
      } catch (error) {
        logError(error, 'Tentativa de remover cargo');
        return;
      }
    }
  
    const messageID = reaction.message.id;
    const role = (await xata.db.roles.select(['id']).filter({ messageID }).getMany())[0];
    const member = reaction.message.guild.members.cache.get(user.id);
    if (member) member.roles.remove(role.id);
  }
};