"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const nodevibrant = require("node-vibrant");
const rgb2hex = require('rgb2hex');
const lodash = require('lodash');

async function list (message, args, disbut, wixData, edit, interaction) {
 
  if (isNaN(parseInt(args[0]))) args[0] = 1;
  let items = [];

  const allItems = (await wixData.query("yukimaruBanners").descending("_updatedDate").find()).items
  if (args[1]) {
    
    items = allItems.filter((item) => [item.name.toLowerCase(), item.type.toLowerCase()].includes(args[1].toLowerCase()));
    
  } else {
    
    args[1] = ""
  
  }
  
  if (!items.length) items = allItems

  let pages = lodash.chunk(items, 20);
  if (parseInt(args[0]) > pages.length) args[0] = pages.length
  
  let bannersList = new discordjs.MessageEmbed()
  .setTitle("Lista de Banners")
  .setDescription("")
  .setColor('#0099ff')
  .setFooter(`Página ${args[0]}/${pages.length}`)

  let next = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('▶️')
  .setID("1_" + (parseInt(args[0]) + 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  let previous = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('◀️')
  .setID("1_" + (parseInt(args[0]) - 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  if (args[0] != pages.length) { bannersList.footer.text += ` — Use !banner-list ${parseInt(args[0]) + 1}_${args[1]} para ir para a próxima página.`.replace("_ para ir para a próxima página.", " para ir para a próxima página."); next.setDisabled(false); }
  if (args[0] > 1) previous.setDisabled(false);

  pages[args[0] - 1].forEach(item => {

    bannersList.setDescription(bannersList.description += `[${item.type}] - ${global.capitalize(item.name)}` + "\n") 

  });
  
  if (edit) {message.edit({embed: bannersList, components: [previous, next]}).then(interaction.reply.defer());}
  else {message.channel.send("<@" + message.author.id + ">", {embed: bannersList, components: [previous, next]});}


}

async function info (message, args, wixData) {

  const banner = (await wixData.query("yukimaruBanners").eq("name", args[0].toLowerCase()).find()).items[0];
  
  if (banner) {

    const generalItemsData = (await wixData.queryReferenced("yukimaruBanners", banner._id, "generalItems"));
    let generalItems = generalItemsData._items;
    if (generalItemsData._totalCount > 50) generalItems = [...generalItems, ...((await wixData.queryReferenced("yukimaruBanners", banner._id, "generalItems", {"skip": 50}))._items)];

    const boostedItems = (await wixData.queryReferenced("yukimaruBanners", banner._id, "boostedItems"))._items;
    
    let fields = ["", "", "", "", ""];

    generalItems.filter(item => item.level == 3).forEach(item => fields[0] += ", `" + global.capitalize(item.name) + "`");
    generalItems.filter(item => item.level == 4).forEach(item => fields[1] += ", `" + global.capitalize(item.name) + "`");
    generalItems.filter(item => item.level == 5).forEach(item => fields[2] += ", `" + global.capitalize(item.name) + "`");
    boostedItems.filter(item => item.level == 4).forEach(item => fields[3] += ", `" + global.capitalize(item.name) + "`");
    boostedItems.filter(item => item.level == 5).forEach(item => fields[4] += ", `" + global.capitalize(item.name) + "`");

    const bannerlisted = new discordjs.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(global.capitalize(banner.name))
    .addField("Tipo", banner.type, false);

    await fields.forEach((field, index) => {

      if (field != "" && index > 2) {

        bannerlisted.addField(`[🆙 ${index + 1}★]`, field.substr(2) + ` (${field.split("`, `").length})`, false);

      } else if (field != "") {
        
        bannerlisted.addField(`[${index + 3}★]`, field.substr(2) + ` (${field.split("`, `").length})`, false);
        
      }

    })
    
    message.reply(bannerlisted);

  } else {

    message.reply('Banner/oração inexistente ou não informado.');

  }

}

module.exports = {list, info}