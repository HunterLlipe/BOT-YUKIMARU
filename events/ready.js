module.exports = {
	name: 'ready',
	once: true,
	execute(bot) {
		console.log(`Servidor online e bot respondendo como ${bot.user.tag}.`);
	},
};