/*

  YUKIMARU BOT
  desenvolvido por Enzo N. Barata

  Meus sinceros agradecimentos ao Llipe e ao Renan que apoiaram esse projeto e confiaram em mim para realizá-lo.

  Para tentar tirar qualquer dúvida quanto ao código, contato:
  DISCORD: @enzon19 | E-MAIL: contato@enzon19.com

  Versão atual: 4.1.1

*/

'use strict';

const logError = require('./core/logError');
const botWeb = require('express')();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction
  ]
});
bot.cooldowns = new Collection();

const { getXataClient } = require("./xata");
const xata = getXataClient();

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: "duwng4tki",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_TOKEN
});

global.bot = bot;
global.xata = xata;
global.cloudinary = cloudinary;

require('./core/commandsCore').deployCommands();
require('./core/eventsCore').deployEvents();

process.on('unhandledRejection', (reason, promise) => logError(reason, promise));
process.on('uncaughtException', (reason, origin) => logError(reason, origin));

botWeb.get('/', (req, res) => { 
  res.send('Yukimaru Bot online.');
});

botWeb.get('/items', (req, res) => { 
  res.sendFile(__dirname + '/index.html');
});

botWeb.listen(3000);
bot.login(process.env.DISCORD_TOKEN);