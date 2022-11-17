"use strict";

const discordjs = require("discord.js");
const commandsList = require('./commandsList.js');
const accents = require('remove-accents');
const axios = require('axios');

function ping (message) {

  message.reply("🏓 Pong!");

}

async function stats (message, botStats) {
  
  const keys = await botStats.getAll();
  const stats = Object.entries(keys).filter(e => e[0].startsWith("cmd_") && e[1] != null);

  const statsInfo = new discordjs.MessageEmbed()
  .setColor('#ad481d')
  .setTitle('Estatísticas do Bot')
  .setDescription('');
  
  const cmds = stats.map(e => e[0].slice(4).replace(/_/g, " "));
  const fullCmds = commandsList.filter(e => cmds.includes(accents.remove(e.name))).map(e => e.name).sort();
  const times = stats.map(e => e[1]);

  cmds.forEach((item, index) => statsInfo.description += fullCmds[index] + " foi usado " + Number(times[index]) + " vezes.\n");
  statsInfo.description = statsInfo.description.split("\n").sort().join("\n");

  message.reply(statsInfo);

}

async function repeat (message, args) {
  let repeatEmbed = "";
  if (args[0] == "!repete") args = "";
  if (message.attachments.size > 0 && message.attachments.first().name.toLowerCase().endsWith(".json")) repeatEmbed = (await axios.get(message.attachments.first().url)).data;
  
  if (args || repeatEmbed) {
    message.channel.send(repeatEmbed);
  } else {
    message.reply('você não mandou nada para repetir!');
  }
}

async function getAll (message, db) {
  const backup = new discordjs.MessageAttachment(Buffer.from(JSON.stringify(await db.getAll(), null, 2)), 'database.json')
  message.channel.send(backup); 
}

async function setNew (message, args, db) {
  if (message.attachments.size > 0 && message.attachments.first().name.toLowerCase().endsWith(".json")) {
    db.set(args[0], (await axios.get(message.attachments.first().url)).data).then(() => {
      message.channel.send(`Adicionado em ${args[0]}.`);
    });
  } else {
    message.reply('você não mandou nada para adicionar na database!');
  }
}

async function setAll (message, db) {
  if (message.attachments.size > 0 && message.attachments.first().name.toLowerCase().endsWith(".json")) {
    await db.empty();
    db.setAll((await axios.get(message.attachments.first().url)).data).then(() => message.reply('Banco de dados configurado!'));
  } else {
    message.reply('você não mandou nada para aplicar como database!');
  }
}

module.exports = {ping, stats, repeat, getAll, setAll, setNew}
