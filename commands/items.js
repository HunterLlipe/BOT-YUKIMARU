"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const nodevibrant = require("node-vibrant");
const rgb2hex = require('rgb2hex');
const axios = require('axios');
const lodash = require('lodash');

async function list (message, args, disbut, wixData, edit, interaction) {
 
  const allItems = (await wixData.query("yukimaruItems").limit(1000).descending("level").find()).items
  
  let items = [];
  
  if (args[1]) {

    items = allItems.filter((item) => item.name.toLowerCase().includes(args[1].toLowerCase()) || item.type.toLowerCase().includes(args[1].toLowerCase()) || item.level.toString().includes(args[1].toLowerCase()));
    
  } else {
    
    args[1] = ""
    
  }
  
  if (!items.length) items = allItems

  let pages = lodash.chunk(items, 20);

  if (isNaN(parseInt(args[0]))) args[0] = 1;
  if (parseInt(args[0]) > pages.length) args[0] = pages.length

  let itemsList = new discordjs.MessageEmbed()
  .setTitle("Lista de Itens")
  .setDescription("")
  .setColor('#0099ff')
  .setFooter(`Página ${args[0]}/${pages.length}`)

  let next = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('▶')
  .setID("0_" + (parseInt(args[0]) + 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  let previous = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('◀')
  .setID("0_" + (parseInt(args[0]) - 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  if (parseInt(args[0]) != pages.length) { itemsList.footer.text += ` — Use !item-list ${parseInt(args[0]) + 1}_${args[1]} para ir para a próxima página.`.replace("_ para ir para a próxima página.", " para ir para a próxima página."); next.setDisabled(false); }
  if (parseInt(args[0]) > 1) previous.setDisabled(false);

  pages[parseInt(args[0]) - 1].forEach(item => {

    itemsList.setDescription(itemsList.description += `[${item.level}★] [${item.type}] - ${global.capitalize(item.name)}` + "\n") 

  });
  
  if (edit) {message.edit({embed: itemsList, components: [previous, next]}).then(interaction.reply.defer());}
  else {message.channel.send("<@" + message.author.id + ">", {embed: itemsList, components: [previous, next]});}


}

async function info (message, args, wixData) {
try {

  let item = (await wixData.query("yukimaruItems").eq("name", args[0].toLowerCase()).find()).items[0]

  if (item) {

    let itemListed = new discordjs.MessageEmbed()
    .setTitle(global.capitalize(item.name))
    .setDescription(["Arma", "Personagem", " Não cadastrado no bot"][["weapon", "character", "none"].indexOf(item.type)])
    .addField("Raridade", item.level);
    
    if (item.photo != "") {
      
      let palette = await nodevibrant.from(item.photo).getPalette()
      itemListed.setImage(item.photo);
      itemListed.setColor(rgb2hex(`rgb(${parseInt(palette.Vibrant._rgb[0])},${parseInt(palette.Vibrant._rgb[1])},${parseInt(palette.Vibrant._rgb[2])})`).hex);

    }

    message.reply(itemListed);
  
  } else {

    message.reply('Item inexistente ou não informado.');

  }
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

module.exports = {list, info}