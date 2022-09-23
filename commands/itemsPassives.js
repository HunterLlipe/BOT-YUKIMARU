"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const nodevibrant = require("node-vibrant");
const rgb2hex = require('rgb2hex');
const axios = require('axios');
const lodash = require('lodash');

async function passives (args, message, disbut, edit, wixData) {
try {
  let level = args[1];
  if (isNaN(parseInt(level)) || level > 5) level = 1;
  
  let item = (await wixData.query("yukimaruItems").eq("type", "weapon").eq("name", args[0].toLowerCase()).find()).items[0];
  let res = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=opensearch&search=${encodeURIComponent(args[0].toLowerCase())}&limit=10&namespace=0&format=json`); 
  let link = res.data[3][res.data[1].findIndex((item) => item.toLowerCase() == args[0].toLowerCase())]
  let data;

  if (!item && link) {

    data = Object.values((await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${link.substr(45)}&rvprop=content&format=json`)).data.query.pages)[0].revisions

    if (data) {

      item = {"name": res.data[1].find((item) => item.toLowerCase() == args[0].toLowerCase()), "type": {"personagem": "character", "arma": "weapon"}[(data[0]["*"].match(/personagem|arma/i)[0]).toLowerCase()], "photo": (await axios.get("https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/" + encodeURIComponent(data[0]["*"].replace(/\n/g, " ").match(/image ?= ?(.*?)\|/)[1].replace(/.*<gallery ?.*?> ?/, "")))).request._redirectable._options.href, "level": parseInt(data[0]["*"].replace(/\n/g, "").match(/rarity.*?= ?(.*?)\|/)[1])}

    }

  } 
  
  if (item && link) {

    if (item.type == "weapon") {

      const passiveInfos = new discordjs.MessageEmbed()
      .setAuthor(global.capitalize(args[0]), `https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Arma_${global.capitalize(args[0]).replace(/ /g, "_")}.png`, `https://genshin-impact.fandom.com/pt-br/wiki/${global.capitalize(args[0]).replace(/ /g, "_")}`)
      .setURL(`https://genshin-impact.fandom.com/pt-br/wiki/${global.capitalize(args[0]).replace(/ /g, "_")}`)
      .setFooter(`Dica: Use ${[`!ascensões ${global.capitalize(args[0])} para ver as ascensões`, `!item-info ${global.capitalize(args[0])} para ver informações`][Math.floor(Math.random() * 2)]} da arma.`);

      if (item.photo != "") {
        
        let palette = await nodevibrant.from(item.photo).getPalette()
        passiveInfos.setColor(rgb2hex(`rgb(${parseInt(palette.Vibrant._rgb[0])},${parseInt(palette.Vibrant._rgb[1])},${parseInt(palette.Vibrant._rgb[2])})`).hex);

      }

      generatePassives(link.substr(45), message, level, passiveInfos, disbut, edit);

    } else {

      message.reply('Item informado não é uma arma.');

    }
  
  } else if (item && !link) {

    message.reply('infelizmente esse item ainda não possui essas informações.');
    
  } else {

    message.reply('Arma inexistente, não informada ou não é uma arma.');

  }
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

function generatePassives (name, message, level, embed, disbut, edit, interaction) {
try {
  let infos = [];
  let variables = [];

  axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${name}&rvprop=content&format=json`).then((res) => {

    let labels = ["passive", "effect", `eff_rank${level}_var1`, `eff_rank${level}_var2`, `eff_rank${level}_var3`];
    //"passive", "effect", "eff_rank1_var1", "eff_rank2_var1", "eff_rank3_var1", "eff_rank4_var1", "eff_rank5_var1", "eff_rank1_var2", "eff_rank2_var2", "eff_rank3_var2", "eff_rank4_var2", "eff_rank5_var2", "eff_rank1_var3", "eff_rank2_var3", "eff_rank3_var3", "eff_rank4_var3", "eff_rank5_var3"

    if (Object.values(res.data.query.pages)[0].revisions != undefined) {

      let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].replace(/(?={{Color).*?(\|.*?\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{Color).*?(\|.*?\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{).*?\|termo=(.*?)\|.*?(?<=}})|(?={{).*?\|termo=(.*?)}}(?<=}})/gi, "$1$2").split("|")
      array.splice(0, 1)
      array.forEach((item) => {
        
        item = item.split("=");
        item[0] = item[0].replace(/ /g, "");
        if (item[1] != undefined) item[1] = item[1].replace(/(\(var1\)%?)/g, "**$1**").replace(/(\(var2\)%?)/g, "**$1**").replace(/(\(var3\)%?)/g, "**$1**").replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\n/g, "").replace(/ ?<br ? ?\/? ?>/gi, "\n").replace(/: ''/g, ":'' ").replace(/'' /g, "*").replace("<!--  x  -->", "").replace("<!--Character Information-->", "").replace("<!--Titles-->", "").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").split("}")[0].split("<ref>")[0];

        if (labels.indexOf(item[0]) > -1) {
          
          if (item[0].startsWith("eff_")) {

            variables.push(item[1].replace(/ /g, ""));

          } else if (item[0] == "effect") {
            
            embed.description = item[1]

          } else if (item[0] == "passive") { 
            
            embed.title = item[1];
            
          }

        }

      });

      /*if (variables.length > 0) embed.description = embed.description.replace(/\(var1\)/g, variables[0])
      if (variables.length > 1) embed.description = embed.description.replace(/\(var1\)/g, variables[0]).replace(/\(var2\)/g, variables[1])
      if (variables.length > 2) embed.description = embed.description.replace(/\(var1\)/g, variables[0]).replace(/\(var2\)/g, variables[1]).replace(/\(var3\)/g, variables[2])*/

      embed.description = embed.description.replace(/\(var1\)/g, variables[0]).replace(/\(var2\)/g, variables[1]).replace(/\(var3\)/g, variables[2]);
      let buttons = new disbut.MessageActionRow();

      for (let i = 1; i < 6; i++) {

        let j = 0;
        if (i == level) j = 1;

        buttons.addComponents(

          new disbut.MessageButton()
          .setStyle(['grey', 'blurple'][j])
          .setLabel(i.toString()) 
          .setID("9_" + i)

        );

      }

      if (edit) {message.edit({embed: embed, components: [buttons]}).then(interaction.reply.defer());}
      else {message.channel.send("<@" + message.author.id + ">", {embed: embed, components: [buttons]});}

    } else {

      message.reply('infelizmente esse item ainda não possui essas informações.');

    }
    
  }).catch((e) => console.log(`Deu erro, mané! (${name}): ${e}\n\n----------------------\n`));
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

module.exports = {passives, generatePassives }