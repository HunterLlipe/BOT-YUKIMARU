"use strict";

const axios = require("axios");
const discordjs = require("discord.js");

function list (message) {
try {
  let complete = "";

  axios.get("https://feeds.c3kay.de/genshin.json").then((res) => {

    let news = res.data.items.map((item, index) => index + 1 + " - " + item.title)
    
    for (let i = 0; i < Math.ceil(news.length / 2); i++) {

      complete = complete + news[i] + "\n"

    }

    const newsList = new discordjs.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Notícias Recentes')
    .setDescription(complete)

    message.reply(newsList);
  
  }).catch(e => message.reply("Infelizmente o servidor de notícias está fora do ar ou apresentou um erro. Informações: " + e));
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

function parseGet (message, args) {
try {
  axios.get("https://feeds.c3kay.de/genshin.json").then((res) => {

    if (isNaN(parseInt(args)) || parseInt(args) < 1) args[0] = 1;
    if (parseInt(args[0]) > 23) args[0] = 23;

    if (res.data.items[parseInt(args[0]) - 1]) {
      const newsObj = new discordjs.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(res.data.items[parseInt(args[0]) - 1].title)
      .setURL(res.data.items[parseInt(args[0]) - 1].url)
      
      if (res.data.items[parseInt(args[0]) - 1].content_html.match(/https?:\/\/.+?\.jpg|https?:\/\/.+?\.png/)[0] != null || res.data.items[parseInt(args[0]) - 1].content_html.match(/https?:\/\/.+?\.jpg|https?:\/\/.+?\.png/)[0] != undefined) newsObj.setImage(res.data.items[parseInt(args[0]) - 1].content_html.match(/https?:\/\/.+?\.jpg|https?:\/\/.+?\.png/)[0]);
  
      message.reply(newsObj)
    } else {
      message.reply("Parece que essa notícia foi excluída ou está fora do ar.")
    }

  }).catch(e => message.reply("Infelizmente o servidor de notícias está fora do ar ou apresentou um erro. Informações: " + e));
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

module.exports = {list, parseGet};