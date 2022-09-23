"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const nodevibrant = require("node-vibrant");
const rgb2hex = require('rgb2hex');
const axios = require('axios');

async function talents (args, message, disbut, wixData) {
try {
  if (args[1] == undefined) args[1] = "attack";

  let item = (await wixData.query("yukimaruItems").eq("type", "character").eq("name", args[0].toLowerCase()).find()).items[0];
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

    if (item.type == "character") {

      const talentInfos = new discordjs.MessageEmbed()
      .setFooter(`Dica: Use ${[`!constelações ${global.capitalize(args[0])} para ver as constelações`, `!item-info ${global.capitalize(args[0])} para ver informações`, `!ascensões ${global.capitalize(args[0])} para ver as ascensões e atributos`][Math.floor(Math.random() * 3)]} do personagem.`)

      if (item.photo != "") {
        
        let palette = await nodevibrant.from(item.photo).getPalette()
        talentInfos.setColor(rgb2hex(`rgb(${parseInt(palette.Vibrant._rgb[0])},${parseInt(palette.Vibrant._rgb[1])},${parseInt(palette.Vibrant._rgb[2])})`).hex);

      }

      if (args[0].toLowerCase().split(" ").length >= 2 && args[0].toLowerCase() != "hutao" && args[0].toLowerCase() != "shogun raiden") {

        talentInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/${global.capitalize(args[0]).split(" ")[1]}.webp`)

      } else if (args[0].toLowerCase() == "hutao") {

        talentInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/Hu-Tao.webp`)

      }  else if (args[0].toLowerCase() == "yunjin") {

        talentInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/Yun-Jin.webp`)

      } else if (args[0].toLowerCase() == "yae miko") {
  
        talentInfos.setAuthor(global.capitalize(args[0]), `https://genshin.honeyhunterworld.com/img/char/yaemiko_face.png`)
  
      } else {

        talentInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/${global.capitalize(args[0]).split(" ")[0]}.webp`)

      }

      generateTalents(link.substr(45), args[1].toLowerCase(), message, talentInfos, false, disbut, null);

    } else {

      message.reply('Item informado não é um personagem.');

    }

  } else if (item && !link) {

    message.reply('infelizmente esse item ainda não possui essas informações.');
    
  } else {

    message.reply('Personagem inexistente, não informado ou não é um personagem.');

  }
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

function generateTalents (name, type, message, embed, edit, disbut, interaction) {

  let infos = [];
  let atributes = {};
  let labels = ["attack", "skill", "burst", "passive1", "passive2", "passive3"];
  if (name == "Hu_Tao") name = "Hutao"
  let yoyoyo, i;

  if (labels.indexOf(type) == -1) type = "attack";

  axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${name}&rvprop=content&format=json`).then((res) => {

    if (Object.values(res.data.query.pages)[0].revisions != undefined) {

      let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].split("|");

      array.splice(0, 1)
      array.forEach((item) => {
        
        item = item.split("=");
        item[0] = item[0].replace(/ /g, "");
        if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace("<!--  x  -->", "").replace("<!--Character Information-->", "").replace("<!--Titles-->", "").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").split("}")[0].split("<ref>")[0];
        
        if (labels.indexOf(item[0]) > -1) {
          
          if (item[1] != undefined) {if (item[1][0] == " ") item[1] = item[1].replace(" ", ""); if (item[1][item[1].length - 1] == " ") item[1] = item[1].substr(0, item[1].length - 1);}
          
          if (type == item[0]) {

            axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${encodeURIComponent(item[1].replace(/ /g, "_"))}&rvprop=content&format=json`).then((res2) => {

              yoyoyo = res2;
              embed.title = Object.values(res2.data.query.pages)[0].title;
              embed.url = `https://genshin-impact.fandom.com/pt-br/wiki/${item[1].replace(/ /g, "_")}`;
              embed.thumbnail = {url: `https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Talento_${item[1].replace(/ /g, "_")}.png`};

              array = Object.values(res2.data.query.pages)[0].revisions[0]["*"].split("|");

              array.splice(0, 1)
              array.forEach((item2) => {
                
                item2 = item2.split("=");
                item2[0] = item2[0].replace(/ /g, "");
                if (item2[1] != undefined) item2[1] = item2[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\+,/g, "+").replace("<!--  x  -->", "").replace("<!--Character Information-->", "").replace("<!--Titles-->", "").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").replace(/\*/g, "\n• ").replace(/<sup>o<\/sup>/g, "º").replace(/<sup>/g, "").replace(/<\/sup>/g, "").replace(/'''/g, "**").replace(/\.,/g, ".").replace(/, \*\*/g, "\n**").replace(/\*\*,/g, "**\n").split("}")[0].split("<ref>")[0];        
                
                let labels = ["type", "info", "energyCost", "CD", "duration", "attr1", "value1", "attr2", "value2", "attr3", "value3", "attr4", "value4", "attr5", "value5", "attr6", "value6", "attr7", "value7", "attr8", "value8", "attr9", "value9", "attr10", "value10", "attr11", "value11", "attr12", "value12", "attr13", "value13", "attr14", "value14", "attr15", "value15"]; 
                let ptLabels = ["Tipo", "Informações", "Custo de Energia", "Tempo de Recarga", "Duração", "attr1", "value1", "attr2", "value2", "attr3", "value3", "attr4", "value4", "attr5", "value5", "attr6", "value6", "attr7", "value7", "attr8", "value8", "attr9", "value9", "attr10", "value10", "attr11", "value11", "attr12", "value12", "attr13", "value13", "attr14", "value14", "attr15", "value15"];
                if (item2[1] != undefined) if (item2[1][0] == " ") item2[1] = item2[1].replace(" ", "");

                if (labels.indexOf(item2[0]) > -1 && item2[1] != "" && item2[1] != " " && item2[1] != undefined) {
                  
                  if (labels[labels.indexOf(item2[0])].startsWith("attr")) {atributes[item2[0]] = item2[1];}
                  else if (labels[labels.indexOf(item2[0])].startsWith("value")) {atributes[item2[0]] = item2[1];}
                  else {if (item2[0] == "info") { 

                    let infoDes = Object.values(res2.data.query.pages)[0].revisions[0]["*"].split(/\| ?info/)[1].replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{).*?\|termo=(.*?)\|.*?(?<=}})|(?={{).*?\|termo=(.*?)}}(?<=}})/gi, "$1$2").split("=")[1];
                    infoDes = infoDes.replace("\n|", "|").replace(/(\w)\|(\w)/g, "$1/$2").split("|" + infoDes.split("|")[infoDes.split("|").length - 1])[0].replace(/\[\[(.*?)\|(.*?)\]\]/g, "$2").replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/<br>/g, "\n").replace("<!--  x  -->", "").replace("<!--Character Information-->", "").replace("<!--Titles-->", "").replace(/\*/g, "• ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").replace(/\n<!--/g, "").replace(/<!--/g, "").replace(/'''/g, "**").replace(/\.,/g, ".").replace(/, \*\*/g, "\n**").replace(/<sup>o<\/sup>/g, "º").replace(/<sup>/g, "").replace(/<\/sup>/g, "").replace(/"''|''"/g, '"').replace(/<ref>.*<\/ref>/g, "").replace(/•\n|• \n/g, "").replace(/<br>/gi, "\n").replace(/\n}}/g, "}}").replace("\n|", "|").replace(/• •/g, "\u200b \u200b•").replace(/\n\n\n/g, "\n\n").replace(/[A-z]nota 1/gi, " (nota 1)").replace(/  /g, " ").split("}")[0];
                    
                    if (infoDes.length > 2599) infoDes = infoDes.substr(0, 2599) + "..."
                    embed.description = infoDes.replace(/(.)\n$/, "$1").replace(/\.\|/g, ".") + "\n\u200b";
                  
                  } else if (item2[0] == "type") {

                    embed.title += " (" + item2[1].replace("a Ascensão", "ª Ascensão") + ")"

                  } else { infos.push({ name: ptLabels[labels.indexOf(item2[0])], value: item2[1], inline: true }); }}

                }

                infos.sort(function (a, b) {
                  return ptLabels.indexOf(a.name) - ptLabels.indexOf(b.name);
                });

              });

              for (i = 1; i < 16; i++) {

                if (atributes["attr" + i] != undefined && atributes["value" + i] != undefined && atributes["attr" + i].match(/Attribute[0-9]{1,2}/) == null) infos.push({ name: atributes["attr" + i], value: atributes["value" + i].replace("<!--", ""), inline: true });
                if (i == 15 && infos[infos.length - 1] != undefined) {infos[infos.length - 1].inline = false; infos[infos.length - 1].value += "\n\u200b"}

              }

              axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${encodeURIComponent(item[1].replace(/ /g, "_"))}&rvprop=content&format=json&rvexpandtemplates`).then((res3) => {

                if (Object.values(res3.data.query.pages)[0].revisions[0]["*"].includes("Material de Elevação de Talento")) {
              
                  array = Object.values(res3.data.query.pages)[0].revisions[0]["*"].split("[[Material de Elevação de Talento|Material de Elevação<br/>de Talento]]")[1].split("==")[0].replace(/.*([0-9] ?→ ?[0-9]{1,2})/g, "!$1").replace(/<\/span>/g, "").split("!")
                  
                  array.forEach((item4) => {

                    item4.replace(/\n/g, "");
                    let upgradeCost = item4.replace(/(.*\| style((.|\n)*)|.*\|style((.|\n)*))/g, "YUKI$1").replace(/((.|\n)*)(YUKI)/g, "").replace(/.*\]\] ([0-9]{1,2}) \[\[(.*)\|.*/g, '$1x $2').replace(/\|.*style.*\n/g, "").split("|")[0].replace(/\n([0-9])/g, ", $1");
                    if (!isNaN(parseInt(item4.split("|")[0][0]))) infos.push({ name: "Talento Nível " + item4.split("|")[0], value: `(${item4.split("|")[1].replace(/\n/g, "")}) - ${item4.split("|")[2].replace(/\n/g, "")} Mora\n${upgradeCost}`, inline: true });

                  })
              
                } 

                embed.fields = infos;
                const buttonsLabelsIDs = [["attack", "skill", "burst", "passive1", "passive2", "passive3"], ["Ataque Normal", "Habilidade Elemental", "Supremo", "Passivo de 1ª Ascensão", "Passivo de 4ª Ascensão", "Passivo Utilitário"]]
                let buttons1 = new disbut.MessageActionRow();
                let buttons2 = new disbut.MessageActionRow();

                for (i = 0; i < 6; i++) {

                  let j = 0;
                  if (buttonsLabelsIDs[0][i] == type) j = 1;

                  if (i > 2) {

                    buttons2.addComponents(

                      new disbut.MessageButton()
                      .setStyle(['grey', 'blurple'][j])
                      .setLabel(buttonsLabelsIDs[1][i]) 
                      .setID("5_" + buttonsLabelsIDs[0][i])

                    );
                  
                  } else {

                    buttons1.addComponents(

                      new disbut.MessageButton()
                      .setStyle(['grey', 'blurple'][j])
                      .setLabel(buttonsLabelsIDs[1][i]) 
                      .setID("5_" + buttonsLabelsIDs[0][i])

                    );

                  }

                }

                if (edit) {message.edit({embed: embed, components: [buttons1, buttons2]}).then(interaction.reply.defer());}
                else {message.channel.send("<@" + message.author.id + ">", {embed: embed, components: [buttons1, buttons2]});}

              });

            }).catch((e) => console.log(Object.values(yoyoyo.data.query.pages), `https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${encodeURIComponent(item[1].replace(/ /g, "_"))}&rvprop=content&format=json`, e));

          }

        } 

      });

    } else {

      message.reply('Infelizmente esse personagem ainda não possui essas informações.');

    }

  });

}

module.exports = {talents, generateTalents};