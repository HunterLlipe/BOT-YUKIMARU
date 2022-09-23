"use strict";

const discordjs = require('discord.js');
const fs = require('fs');
const requireFromString = require("require-from-string");

function help (message, args, command) {

  let commandsHelp = requireFromString(fs.readFileSync("./commandsList.js","utf8"));
  commandsHelp = commandsHelp.filter(e => e.admin == false);

  let result = commandsHelp.filter((item) => item.command.replace("!", "") == args[0].toLowerCase().replace("!", ""))
  if (result.length == 0) result = commandsHelp.filter((item) => item.alternative.map(item => item.replace("!", "")).indexOf(args[0].toLowerCase().replace("!", "")) != -1)

  if (args[0].toLowerCase() == command) {

    let commandsList = "";

    for (let i = 0; i < commandsHelp.length; i++) {

      commandsList += "\n" + commandsHelp[i].command.replace("!", "");

    }
  
    const ajudanores = new discordjs.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Ajuda - Lista de comandos')
    .setDescription('Faça `!ajuda [comando]` para obter mais informações. Exemplo: `!ajuda roll`\n\n**Lista:**\n```' + commandsList + '```')
    .setFooter('<parâmetro> - obrigatório\n[parâmetro] - opcional\nopção1|opção2 - uma das opções (neste caso: opção1 ou opção2)');

    message.reply(ajudanores);
  
  } else if (result.length != 0) {

    const ajudares = new discordjs.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('[Ajuda] ' + result[0].name)
    .setDescription(result[0].description)
    .addField('Comando', ('`' + result[0].command + " " + result[0].args + '`').replace("  ", ""), false)
    .setFooter('<parâmetro> - obrigatório\n[parâmetro] - opcional\nopção1|opção2 - uma das opções (neste caso: opção1 ou opção2)');
    
    if (result[0].example != "") ajudares.addField('Exemplo', '`' + result[0].example + '`', false);
    if (result[0].alternative != "") ajudares.addField('Outros jeitos de usar', "`" + result[0].alternative.map(item => (item + " " + result[0].args).replace("  ", "")).join("`, `") + "`", false);

    message.reply(ajudares);

  } else {

    message.reply('Comando inexistente.');

  }

}

function helpAdmin (message, args, command) {

  let commandsHelpAdmin = requireFromString(fs.readFileSync("./commandsList.js","utf8"));
  commandsHelpAdmin = commandsHelpAdmin.filter(e => e.admin == true);

  let result = commandsHelpAdmin.filter((item) => item.command.replace("!", "") == args[0].toLowerCase().replace("!", ""))
  if (result.length == 0) result = commandsHelpAdmin.filter((item) => item.alternative.map(item => item.replace("!", "")).indexOf(args[0].toLowerCase().replace("!", "")) != -1)

  if (args[0].toLowerCase() == command) {

    let commandsList = "";

    for (let i = 0; i < commandsHelpAdmin.length; i++) {

      commandsList += "\n" + commandsHelpAdmin[i].command.replace("!", "");

    }
  
    const ajudaadminnores = new discordjs.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Ajuda - Lista de comandos para administrador')
    .setDescription('Faça `!ajuda-admin [comando]` para obter mais informações. Exemplo: `!ajuda-admin item-add`\n\n**Lista:**\n```' + commandsList + '```')

    message.reply(ajudaadminnores);
  
  } else if (result.length != 0) {

    const ajudaadminres = new discordjs.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('[Ajuda Administrador] ' + result[0].name)
    .setDescription(result[0].description)
    .addField('Comando', ('`' + result[0].command + " " + result[0].args + '`').replace("  ", ""), false)
    
    if (result[0].example != "") ajudaadminres.addField('Exemplo', '`' + result[0].example + '`', false);
    if (result[0].alternative != "") ajudaadminres.addField('Outros jeitos de usar', "`" + result[0].alternative.map(item => (item + " " + result[0].args).replace("  ", "")).join("`, `") + "`", false);

    message.reply(ajudaadminres);

  } else {

    message.reply('Comando inexistente ou é um comando comum para todos os membros.');

  }

}

module.exports = {help, helpAdmin};