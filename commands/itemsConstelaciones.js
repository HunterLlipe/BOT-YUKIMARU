"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const nodevibrant = require("node-vibrant");
const rgb2hex = require('rgb2hex');
const axios = require('axios');

async function constelaciones (args, message, disbut, wixData) {
try {
  if (args[1] == undefined) args[1] = "c1";

  let item = (await wixData.query("yukimaruItems").eq("type", "character").eq("name", args[0].toLowerCase()).find()).items[0];

  let res = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=opensearch&search=${encodeURIComponent(args[0].toLowerCase())}&limit=10&namespace=0&format=json`); 
  let link = res.data[3][res.data[1].findIndex((item) => item.toLowerCase() == args[0].toLowerCase())]
  let data;

  if (!item && link) {

    data = Object.values((await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${link.substr(45)}&rvprop=content&format=json`)).data.query.pages)[0].revisions;

    if (data) {

      item = {"name": res.data[1].find((item) => item.toLowerCase() == args[0].toLowerCase()), "type": {"personagem": "character", "arma": "weapon"}[(data[0]["*"].match(/personagem|arma/i)[0]).toLowerCase()], "photo": (await axios.get("https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/" + encodeURIComponent(data[0]["*"].replace(/\n/g, " ").match(/image ?= ?(.*?)\|/)[1].replace(/.*<gallery ?.*?> ?/, "")))).request._redirectable._options.href, "level": parseInt(data[0]["*"].replace(/\n/g, "").match(/rarity.*?= ?(.*?)\|/)[1])}

    }

  }
  
  if (item && link) {

    if (item.type == "character") {

      const constelInfos = new discordjs.MessageEmbed()
      .setFooter(`Dica: Use ${[`!talentos ${global.capitalize(args[0])} para ver os talentos`, `!item-info ${global.capitalize(args[0])} para ver informações`, `!ascensões ${global.capitalize(args[0])} para ver as ascensões e atributos`][Math.floor(Math.random() * 3)]} do personagem.`);

      if (item.photo != "") {
        
        let palette = await nodevibrant.from(item.photo).getPalette()
        constelInfos.setColor(rgb2hex(`rgb(${parseInt(palette.Vibrant._rgb[0])},${parseInt(palette.Vibrant._rgb[1])},${parseInt(palette.Vibrant._rgb[2])})`).hex);

      }

      if (args[0].toLowerCase().split(" ").length >= 2 && args[0].toLowerCase() != "hutao" && args[0].toLowerCase() != "shogun raiden") {

        constelInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/${global.capitalize(args[0]).split(" ")[1]}.webp`)

      } else if (args[0].toLowerCase() == "hutao") {

        constelInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/Hu-Tao.webp`)

      } else if (args[0].toLowerCase() == "yunjin") {

        constelInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/Yun-Jin.webp`)
  
      } else if (args[0].toLowerCase() == "yae miko") {
  
        constelInfos.setAuthor(global.capitalize(args[0]), `https://genshin.honeyhunterworld.com/img/char/yaemiko_face.png`)
  
      } else {

        constelInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/${global.capitalize(args[0]).split(" ")[0]}.webp`)

      }

      generateConstelaciones(link.substr(45), args[1].toLowerCase(), message, constelInfos, false, disbut, null);

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

async function generateConstelaciones (name, type, message, embed, edit, disbut, interaction) {

  let infos = [];
  let atributes = {};
  let labelsTypes = ["c1", "c2", "c3", "c4", "c5", "c6"];
  if (name == "Hu_Tao") name = "Hutao";
  let yoyoyo, i, e;

  if (labelsTypes.indexOf(type) == -1) type = "c1";

  axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${name}&rvprop=content&format=json&rvexpandtemplates`).then(async (res) => {

    if (Object.values(res.data.query.pages)[0].revisions != undefined) {
      
      let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].split("! Nível !! Ícone !! Nome !! Efeito")[1].replace(/(Fora do Meu Caminho)!/g, "$1YUKIEXCLAMATION").replace(/(É o Barão Coelho)!/g, "$1YUKIEXCLAMATION").replace(/(Isso, Queima)!/g, "$1YUKIEXCLAMATION").replace(/(Isso, Queima)!/g, "$1YUKIEXCLAMATION").replace(/(Juntem-se Hora da Briga)!/g, "$1YUKIEXCLAMATION").replace(/(Lá Vem o Touro)!/g, "$1YUKIEXCLAMATION").replace(/(Arataki Itto, Presente)!/g, "$1YUKIEXCLAMATION").split("!")

      array.splice(0, 1)
      array.forEach(async (item) => {
        
        item = item.split("|");

        if (labelsTypes.indexOf(item[0].toLowerCase().replace(/ /g, "").replace(/\n/g, "")) > -1) {
          
          if (type == item[0].toLowerCase().replace(/ /g, "").replace(/\n/g, "")) {
            
            const toSearch = item[4].replace(/YUKIEXCLAMATION/g, "!").replace(/\n/g, "").replace(/ ?\[/g, "").replace(/\]/g, "").toLowerCase();

            let res = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=opensearch&search=${encodeURIComponent(toSearch)}&limit=500&namespace=0&format=json`);

            let fixedName = res.data[3][res.data[1].findIndex((item) => item.toLowerCase() == toSearch || item == `Coelho Ativado (${name})`)].substr(45)

            axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${fixedName}&rvprop=content&format=json`).then(async (res2) => {

              yoyoyo = res2;

              embed.title = Object.values(res2.data.query.pages)[0].title;
              embed.url = `https://genshin-impact.fandom.com/pt-br/wiki/${fixedName}`;
              embed.thumbnail = {url: `https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Constelação_${fixedName}.png`};

              let array2 = Object.values(res2.data.query.pages)[0].revisions[0]["*"].split("|")
              array2.forEach(async (item2) => {

                item2 = item2.split("=");
                item2[0] = item2[0].replace(/ /g, "");

                if (item2[1] != undefined) item2[1] = item2[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\+,/g, "+").replace("<!--  x  -->", "").replace("<!--Character Information-->", "").replace("<!--Titles-->", "").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").replace(/\*/g, "\n• ").replace(/<sup>o<\/sup>/g, "º").replace(/<sup>/g, "").replace(/<\/sup>/g, "").replace(/'''/g, "**").replace(/\.,/g, ".").replace(/, \*\*/g, "\n**").replace(/\*\*,/g, "**\n").split("}")[0].split("<ref>")[0];        
                
                let labels = ["description", "level", "scale_att1", "scale_att2", "scale_att3", "utility1"]; 
                let ptLabels = ["description", "Nível", "Atributo", "Atributo 2", "Atributo 3", "Utilidade"];
                if (item2[1] != undefined) if (item2[1][0] == " ") item2[1] = item2[1].replace(" ", "");

                if (labels.indexOf(item2[0]) > -1 && item2[1] != "" && item2[1] != " " && item2[1] != undefined) {

                  if (item2[0] == "description") { 

                    let infoDes = Object.values(res2.data.query.pages)[0].revisions[0]["*"].split(/\| ?description/)[1].replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{).*?\|termo=(.*?)\|.*?(?<=}})|(?={{).*?\|termo=(.*?)}}(?<=}})/gi, "$1$2").replace(/ ?<ref ?group="note">(.*?)<\/ref> ?| ?<ref ?group="notas">(.*?)<\/ref> ?/gi, " ($1$2) ").replace(/\{\{sic\}\}/gi, "sic").replace(/\| ?link ?= ?.*? /gi, " ").split("=")[1];

                    infoDes = infoDes.replace("\n|", "|").split("|" + infoDes.split("|")[infoDes.split("|").length - 1])[0].replace(/ /, "").replace(/(\w)\|(\w)/g, "$1/$2").replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/<br ?\/?>/g, "\n").replace("<!--  x  -->", "").replace("<!--Character Information-->", "").replace("<!--Titles-->", "").replace(/\*/g, "• ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").replace(/\n<!--/g, "").replace(/<!--/g, "").replace(/'''/g, "**").replace(/\.,/g, ".").replace(/, \*\*/g, "\n**").replace(/<sup>o<\/sup>/g, "º").replace(/<sup>/g, "").replace(/<\/sup>/g, "").replace(/"''|''"/g, '"').replace(/<ref>.*<\/ref>/g, "").replace(/•\n|• \n/g, "").replace(/<br>/gi, "\n").replace(/\n}}/g, "}}").replace("\n|", "|").replace(/• •/g, "\u200b \u200b•").replace(/\n\n\n/g, "\n\n").split("}")[0];
                    
                    if (infoDes.length > 2599) infoDes = infoDes.substr(0, 2599) + "..."
                    embed.description = infoDes

                  } else {
                    
                    infos.push({ name: ptLabels[labels.indexOf(item2[0])], value: item2[1], inline: true });

                  }

                }

              });

              embed.fields = infos;
              let buttons1 = new disbut.MessageActionRow();
              let buttons2 = new disbut.MessageActionRow();

              for (i = 0; i < 6; i++) {

                let j = 0;
                if (labelsTypes[i] == type) j = 1;

                if (i > 2) {

                  buttons2.addComponents(

                    new disbut.MessageButton()
                    .setStyle(['grey', 'blurple'][j])
                    .setLabel(labelsTypes[i].substr(1) + "º Nível") 
                    .setID("8_" + labelsTypes[i])

                  );
                
                } else {

                  buttons1.addComponents(

                    new disbut.MessageButton()
                    .setStyle(['grey', 'blurple'][j])
                    .setLabel(labelsTypes[i].substr(1) + "º Nível") 
                    .setID("8_" + labelsTypes[i])

                  );

                }

              }

              if (edit) {message.edit({embed: embed, components: [buttons1, buttons2]}).then(interaction.reply.defer());}
              else {message.channel.send("<@" + message.author.id + ">", {embed: embed, components: [buttons1, buttons2]});}

            }).catch((e) => console.log(Object.values(yoyoyo.data.query.pages), `https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${encodeURIComponent(fixedName)}&rvprop=content&format=json`), name, e);

          }

        } 

      });

    } else {

      message.reply('Infelizmente esse personagem ainda não possui essas informações.');

    }

  }).catch(e => console.log(`Mensagem: ${message.content}\n\n${e}`));

}

module.exports = {constelaciones, generateConstelaciones}