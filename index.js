"use strict";

/*
                                                                   ________________________
                                                                  |                        |
                                                                  |      YUKIMARU BOT      |
                                                                  |    desenvolvido por    |
                                                                  |     Enzo N. Barata     |
                                                                  |________________________|

  Meus sinceros agradecimentos ao Llipe e ao Renan que apoiaram esse projeto e confiaram em mim para realizá-lo.

  Para tentar tirar qualquer dúvida quanto ao código, contato:
  TELEGRAM: t.me/enzon19 | DISCORD: enzon19#9325 | E-MAIL: contato@enzon19.com

  Versão atual: 3.1.3

*/

require('dotenv').config()

const discordjs = require('discord.js');
const fs = require('fs');
const requireFromString = require("require-from-string");
const disbut = require('discord-buttons');
const wixData = require("./wixRequest/index").setup("enzodatabase", "enzodb", "enzodbtoken");
const Database = require("./database");
const accents = require('remove-accents');

const newsSettings = Database;
const rolesSettings = Database;
const materialsItems = Database;
const botStats = Database;

let talkedRecently = new Set();

let bot = new discordjs.Client({
  fetchAllMembers: true, // Remove this if the bot is in large guilds.
  intents: [discordjs.Intents.FLAGS.GUILDS, discordjs.Intents.FLAGS.GUILD_MESSAGES, discordjs.Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
disbut(bot);

bot.on('ready', () => {

  console.log(`Yukimaru Bot logado como ${bot.user.tag}.`)

  const arrayofStatus = [
    {
      "activity": {
        "name": "Lives do Hunter Llipe",
        "type": "STREAMING",
        "url": "https://twitch.tv/hunterllipe"
      },
      "status": "online"
    },
    {
      "activity": {
        "name": "Hunter Llipe no YouTube",
        "type": "WATCHING",
        "url": "https://www.youtube.com/hunterllipe"
      },
      "status": "dnd"
    },
    {
      "activity": {
        "name": "Geshin Impact",
        "type": "PLAYING"
      },
      "status": "online"
    }
  ];
  
  let index = 0;
  setInterval(() => {

    if (index == arrayofStatus.length) index = 0;
    bot.user.setPresence(arrayofStatus[index]);
    index++;

  }, 1800000)

});

bot.on('message', async message => {

  if (message.content.toString().startsWith("!")) {

    const content = message.content.toString();
    const command = content.split(' ')[0];
    const cleanArgs = content.replace(command + " ", "");
    const args = content.replace(command + " ", "").split("_")
    const variables = { "false": false, "true": true, "null": null, "message": message, "content": content, "command": command, "args": args, "disbut": disbut, "wixData": wixData, "newsSettings": newsSettings, "rolesSettings": rolesSettings, "materialsItems": materialsItems, "cleanArgs": cleanArgs, "botStats": botStats }

    const commandsList = requireFromString(fs.readFileSync("./commandsList.js", "utf8"));
    let filterCommandsList = commandsList;
    
    if (message.member) {

      if (!message.member.hasPermission('ADMINISTRATOR') && message.author.id != 555429270919446549) filterCommandsList = commandsList.filter(e => e.admin == false);

    } else {

      filterCommandsList = commandsList.filter(e => e.admin == false);
      
    }
    
    let sentCommand = filterCommandsList.filter(e => e.command == command.toLowerCase() || e.alternative.includes(command.toLowerCase()))[0];

    if (sentCommand) {

      const isRoll = (sentCommand.name == "Simulador de Oração");
      
      if (talkedRecently.has(message.author.id)) {

        let toDelete = await message.reply(`calma! Aguarde ${["um segundo", "nove segundos"][+isRoll]} para continuar.`);
        if (message.guild == null) message.delete();
        setTimeout(() => {
          toDelete.delete();
        }, 1000);
    
      } else {
  
        const parameters = sentCommand.parameters.map(e => Object.values(variables)[Object.keys(variables).indexOf(e)])
        const module = requireFromString(fs.readFileSync(sentCommand.modulePath, "utf8"));
  
        if (!sentCommand.admin) { 
  
          const nameStats = "cmd_" + accents.remove(sentCommand.name.replace(/ /g, "_"));
          // const cmdNum = await botStats.get(nameStats);
          // await botStats.set(nameStats, Number(cmdNum) + 1);
        
        }
        
        module[sentCommand.function](...parameters);
        
        talkedRecently.add(message.author.id);
        setTimeout(() => {
          talkedRecently.delete(message.author.id);
        }, [1000, 9000][+isRoll]);
  
      }

    } else if (commandsList.filter(e => e.command == command.toLowerCase() || e.alternative.includes(command.toLowerCase()))[0]) {

      message.reply("você não tem permissão para fazer isso!")

    }

  }

});

bot.on('messageReactionAdd', async (reaction, user) => {

  const roles = requireFromString(fs.readFileSync("./commands/roles.js", "utf8"));
  roles.addRole(reaction, user, rolesSettings);

});

bot.on('messageReactionRemove', async (reaction, user) => {

  const roles = requireFromString(fs.readFileSync("./commands/roles.js", "utf8"));
  roles.removeRole(reaction, user, rolesSettings);

});

process.on('unhandledRejection', (reason, promise) => {
  console.log(`Erro!!!\n\n${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, reason.stack || reason);
  try {
    const user = bot.users.cache.get('555429270919446549');
    user.send(`\`\`\`\n${reason.stack || reason}\n\`\`\``);
  } catch {}
})

bot.on('clickButton', interaction => {

  const buttonsActions = requireFromString(fs.readFileSync("./commands/buttonsActions.js", "utf8"));
  const parameters = [interaction, disbut, wixData, materialsItems];
  const functions = [buttonsActions.listItem, buttonsActions.listBanner]
  functions[interaction.id.split("_")[0]](...parameters)

});

bot.on('debug', info => {
  if (info.startsWith("429 hit")) {
    console.log('Bot desconectado do Discord! Vá até a aba "Shell" e digite "kill 1" para reiniciar e entrar novamente no Discord. Data: ' + new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
    //process.exit();
  }
});
bot.on('error', error => console.log(error));
bot.on('rateLimit', (...args) => console.log('rateLimit', ...args));
bot.on('warn', info => console.log(info));

require('./server')(bot, newsSettings);
bot.login(process.env.TOKEN);
console.log('Logando o bot... Espera alguns minutos.');