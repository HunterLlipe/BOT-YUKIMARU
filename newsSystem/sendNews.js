"use strict";

const discordjs = require('discord.js');
const fs = require('fs');

const newsOpts = JSON.parse(fs.readFileSync('./newsSystem/news.json', 'utf8'));
  
const axios = require('axios');

function get2D(num) {

  if (num.toString().length < 2) // Integer of less than two digits

    return '0' + num; // Prepend a zero!

  return num.toString(); // return string for consistency

}

function reduze(str) {

  if (str.length > 262) {

    return str.subStr(0, 261) + ' [...]';

  } else {

    return str;

  }

}

const convertTime12to24 = time12h => {

    const modifier = time12h.substr(time12h.length - 2, time12h.length);
    const time = time12h.substr(0, time12h.length - 2);

    let [hours, minutes] = time.split(':');

    if (hours === '12') {

      hours = '00';

    }

    if (modifier === 'PM') {

      hours = parseInt(hours, 10) + 12;

    }

    return `${hours}:${minutes}`;

};

function convertTZ(date, tzString) {

	return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString } ));

}

async function news(title, link, date, image, bot) {

  const guild = bot.guilds.cache.get(newsOpts.server);
  const channel = guild.channels.cache.get(newsOpts.channels.news);

  let dateTop = date.split(' ')[0].substr(0, 3) + ' ' + date.split(' ')[1].replace(',', '') + ' ' + date.split(' ')[2] + ' ' + convertTime12to24(date.split(' ')[4]);
  let dateFormt = convertTZ(dateTop.substr(0, dateTop.length - 2), 'America/Sao_Paulo');

  const news = new discordjs.MessageEmbed()
  .setColor('#657ef8')
  .setAuthor('Nova notícia!', 'https://uploaddeimagens.com.br/images/003/538/143/original/download2.png?1637074858', 'https://www.hoyolab.com')
  .setTitle(title)
  .setURL(link)
  .setFooter( `${get2D(dateFormt.getDate())}/${get2D(dateFormt.getMonth() + 1)}/${dateFormt.getFullYear()} ${get2D(dateFormt.getHours())}:${get2D(dateFormt.getMinutes())} (Brasília)`);

  if (image != 'http://ifttt.com/images/no_image_card.png') news.setImage(image);

  channel.send(news);

}

async function video(title, link, date, bot) {
  
  const guild = bot.guilds.cache.get(newsOpts.server);
  const channel = guild.channels.cache.get(newsOpts.channels.youtube);

  let dateTop = date.split(' ')[0].substr(0, 3) + ' ' + date.split(' ')[1].replace(',', '') + ' ' + date.split(' ')[2] + ' ' + convertTime12to24(date.split(' ')[4]);
  let dateFormt = new Date(dateTop)

  const video = new discordjs.MessageEmbed()
  .setColor('#eb1818')
  .setAuthor('Novo vídeo!', 'https://uploaddeimagens.com.br/images/003/537/875/original/download.png?1637064983', 'https://www.youtube.com/c/HunterLlipe')
  .setTitle(title)
  .setURL(link)
  .setFooter( `${get2D(dateFormt.getDate())}/${get2D(dateFormt.getMonth() + 1)}/${dateFormt.getFullYear()} ${get2D(dateFormt.getHours())}:${get2D(dateFormt.getMinutes())} (Brasília)`)
  .setImage(`http://i.ytimg.com/vi/${link.substr(32)}/maxresdefault.jpg`);

  channel.send(video);
  
}

async function stream(game, image, bot) {

  const guild = bot.guilds.cache.get(newsOpts.server);
  const channel = guild.channels.cache.get(newsOpts.channels.twitch);

  const stream = new discordjs.MessageEmbed()
  .setColor('#3000a5')
  .setAuthor('Live no ar!', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpngimg.com%2Fuploads%2Fexclamation_mark%2Fexclamation_mark_PNG56.png&f=1&nofb=1', 'https://www.twitch.tv/hunterllipe')
  .setTitle('HunterLlipe está jogando ' + game)
  .setURL('https://www.twitch.tv/hunterllipe')

  if (stream.title == 'HunterLlipe está jogando Just Chatting') stream.title = 'HunterLlipe está conversando';
  
  if (image != "http://ifttt.com/images/no_image_card.png") {

    const file = new discordjs.MessageAttachment(image, 'stream.png');
    stream.attachFiles([file]);
    stream.setImage('attachment://stream.png');

  }

  /*await axios.get('https://api.twitch.tv/helix/streams?user_login=hunterllipe',  {
  headers: { 
    'Client-ID': process.env.TWITCH, 
    'Authorization': 'Bearer ' + process.env.OAUTH
  }
  }).then(res => stream.description = res.data.data[0].title).catch(e => console.log(e));*/
  
  await channel.send(stream);
  //channel.send("https://www.twitch.tv/hunterllipe");

}

function tweet(link, bot) {
  const guild = bot.guilds.cache.get(newsOpts.server);
  const channel = guild.channels.cache.get(newsOpts.channels.twitter);
  
  channel.send(link);
}

module.exports = {news, video, stream, tweet};