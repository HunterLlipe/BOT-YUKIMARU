"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const nodevibrant = require("node-vibrant");
const rgb2hex = require('rgb2hex');
const axios = require('axios');
const lodash = require('lodash');

async function ascension(args, message, disbut, edit, wixData) {

  let item = (await wixData.query("yukimaruItems").eq("name", args[0].toLowerCase()).find()).items[0];
  let res = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=opensearch&search=${encodeURIComponent(args[0].toLowerCase())}&limit=10&namespace=0&format=json`);
  let link = res.data[3][res.data[1].findIndex((item) => item.toLowerCase() == args[0].toLowerCase())]
  let data, tempType;

  if (!item && link) {

    data = Object.values((await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${link.substr(45)}&rvprop=content&format=json`)).data.query.pages)[0].revisions

    if (data) {

      item = { "name": res.data[1].find((item) => item.toLowerCase() == args[0].toLowerCase()), "type": { "personagem": "character", "arma": "weapon" }[(data[0]["*"].match(/personagem|arma/i)[0]).toLowerCase()], "photo": (await axios.get("https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/" + encodeURIComponent(data[0]["*"].replace(/\n/g, " ").match(/image ?= ?(.*?)\|/)[1].replace(/.*<gallery ?.*?> ?/, "")))).request._redirectable._options.href, "level": parseInt(data[0]["*"].replace(/\n/g, "").match(/rarity.*?= ?(.*?)\|/)[1]) }

    }

  }

  if (item && link) {

    const ascensionInfos = new discordjs.MessageEmbed()
      .setTitle("Ascensões e Atributos")
      .setURL(`https://genshin-impact.fandom.com/pt-br/wiki/${link.substr(45)}#Ascens.C3.A3o`)

    if (item.photo != "") {

      let palette = await nodevibrant.from(item.photo).getPalette();
      ascensionInfos.setColor(rgb2hex(`rgb(${parseInt(palette.Vibrant._rgb[0])},${parseInt(palette.Vibrant._rgb[1])},${parseInt(palette.Vibrant._rgb[2])})`).hex);

    }

    if (item.type == "character") ascensionInfos.setFooter(`Dica: Use ${[`!constelações ${global.capitalize(args[0])} para ver as constelações`, `!item-info ${global.capitalize(args[0])} para ver informações`, `!talentos ${global.capitalize(args[0])} para ver os talentos`][Math.floor(Math.random() * 3)]} do personagem.`)
    if (item.type == "weapon") ascensionInfos.setFooter(`Dica: Use ${[`!item-info ${global.capitalize(args[0])} para ver informações`, `!refinamentos ${global.capitalize(args[0])} para ver os refinamentos da passiva`][Math.floor(Math.random() * 2)]} da arma.`)

    if (args[0].toLowerCase().split(" ").length >= 2 && args[0].toLowerCase() != "hutao" && args[0].toLowerCase() != "shogun raiden" && item.type == "character") {

      ascensionInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/${global.capitalize(args[0]).split(" ")[1]}.webp`)

    } else if (args[0].toLowerCase() == "hutao" && item.type == "character") {

      ascensionInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/Hu-Tao.webp`)

    } else if (args[0].toLowerCase() == "yunjin" && item.type == "character") {

      ascensionInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/Yun-Jin.webp`)

    } else if (args[0].toLowerCase() == "yae miko" && item.type == "character") {

      ascensionInfos.setAuthor(global.capitalize(args[0]), `https://genshin.honeyhunterworld.com/img/char/yaemiko_face.png`)

    } else if (item.type == "character") {

      ascensionInfos.setAuthor(global.capitalize(args[0]), `https://impact.moe/assets/img/character-icons/${global.capitalize(args[0]).split(" ")[0]}.webp`)

    } else {

      ascensionInfos.setAuthor(global.capitalize(args[0]), `https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Arma_${global.capitalize(args[0]).replace(/ /g, "_")}.png`);
      //ascensionInfos.setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Arma_${global.capitalize(args[0]).substr(1).replace(/ /g, "_")}.png`);

    }

    generateAscension(link.substr(45), ["character", "weapon"].indexOf(item.type), parseInt(args[1]), message, ascensionInfos, disbut, edit);

  } else if (item && !link) {

    message.reply('infelizmente esse item ainda não possui essas informações.');

  } else {

    message.reply('Item inexistente ou não informado.');

  }

}

async function generateAscension(name, type, level, message, embed, disbut, edit, interaction) {

  if (isNaN(parseInt(level)) || level > 6) level = 0;

  let infos = [];
  if (name == "Hu_Tao") name = "Hutao";
  let upgradeCost;
  let yoyoyo, i;

  axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${name}&rvprop=content&format=json&rvexpandtemplates`).then(async (res) => {

    if (Object.values(res.data.query.pages)[0].revisions != undefined && Object.values(res.data.query.pages)[0].revisions[0]["*"].match(/=?== ?Ascensão ?===?|=?== ?Ascensões ?===?/) != null) {

      let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].split(/=?== ?Ascensão ?===?|=?== ?Ascensões ?===?/)[1].split("}")[0].split(/Materiais Comuns.*?\]\]/)[1].split("!")

      array.splice(0, 1);

      if (level > array.length) level = array.length;

      for (i = 0; i < array.length; i++) {

        let item = array[i]
        let item4 = item

        item = item.replace(/ /g, "").replace(/\n/g, "").split("|");

        if (level == item[0][0]) {

          item4.replace(/\n/g, "");
          upgradeCost = item4.replace(/(.*\|? style((.|\n)*)|.*\|style((.|\n)*))/g, "YUKI$1").replace(/((.|\n)*)(YUKI)/g, "").replace(/.*\]\] ([0-9]{1,2}) \[\[(.*)\|.*|.*\]\] (—) \[\[(.*)\|.*/g, '$1$3x $2$4').replace(/\|.*style.*\n/g, "").split("|")[0].replace(/\n([0-9]{1,2})|\n(—)/g, ", $1$2").replace(/\n/g, "");

          infos.push({ name: "Ascensão " + item[0], value: "Informações:", inline: false });
          infos.push({ name: "Nível", value: item[1].replace(/<hr ?\/? ?>/g, "\n一\n") + "\n\u200b", inline: true });
          if (item[3] != "") infos.push({ name: "Mora", value: item[3], inline: true });
          if (upgradeCost != "") infos.push({ name: "Materiais", value: upgradeCost, inline: true });
          break;

        } else if (level == 0) {

          let text2 = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${name}&rvprop=content&format=json`);

          infos.push({ name: "Ascensão 0 (Nível 1 一 20)", value: ["Informações", Object.values(text2.data.query.pages)[0].revisions[0]["*"].replace(/\n/g, "").replace(/  /g, "").replace(/.*2nd_stat_type ?= ?(.*?)\|base_atk ?= ?(.*?)\|2nd_stat ?= ?(.*?)\|.*/, "Ataque Básico (Nível.1): $2, $1: $3").replace(/.*base_atk ?= ?(.*?)\|2nd_stat_type ?= ?(.*?)\|2nd_stat ?= ?(.*?)\|.*/, "Ataque Básico (Nível.1): $1, $2: $3").replace(/ ?,  ?/g, ", ").replace(/\|.*?,/, ",").replace(/\|.*?:/, ":")][type], inline: false });
          break;

        }

      };

      if (type == 1 && level != 0) {

        let text = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=parse&page=${name}&format=json`)
        text = text.data.parse.text["*"]

        let infosLegacy = [];
        let infosNew = [[], []]
        //console.log(text.replace(/\n/g, "").replace(/\u00a0/g, "").replace(/=/g, "").replace(/.*?Ataque Básico/, 'data-source\"base_atk\">Ataque Básico'))
        
        text.replace(/\n/g, "").replace(/\u00a0/g, "").replace(/=/g, "").replace(/.*?Ataque Básico/, 'data-source\"base_atk\">Ataque Básico').split("data-source").forEach(async (item) => {
          //console.log(item.replace(/"base_atk\\?">(.*?)<\/th?d?>.*/g, "$1").replace(/"2nd_stat\\?">(.*?)<\/th?d?>.*/g, "$1"))
          infosLegacy.push(item.replace(/"base_atk\\?">(.*?)<\/th?d?>.*/g, "$1").replace(/"2nd_stat\\?">(.*?)<\/th?d?>.*/g, "$1"))
        });

        infosLegacy.filter((item) => item != "").forEach(async (item) => {
// ao invés de item[1], eu botei só item, se der ruim, tem que trocar
          if (!isNaN(parseInt(item)) || item.startsWith("Invalid")) {

            infosNew[0].push(item);

          } else {

            infosNew[1].push(item);

          }

        });

        let pitagoras = lodash.chunk(infosNew[1], 3);
        let socrates = lodash.chunk(infosNew[0], 3);
        let atrs = "";

        pitagoras[level - 1].forEach((item, index) => {

          if (index / 3 == 0) { 
            atrs = item + ": " + socrates[level - 1][index]
          } else {
            atrs += ", " + item + ": " + socrates[level - 1][index];
          }

          infos[0].value = atrs

        });

      } else if (type == 0) {

        let eleva = Object.values(res.data.query.pages)[0].revisions[0]["*"].split(/===? ?Atributos Básicos|===? ?Status Base|===? ?Atributos Base/)[1]
        let pitagoras = eleva.replace(/class="table-par"\|?/g, "").replace(/rowspan="2" \|/g, "").replace(/\n/g, "").split("!");
        let all = [];

        pitagoras.forEach((item, index) => {

          if (item.replace(/ ?[0-9]/, "YUKISTART").startsWith("YUKISTART")) {

            let atrs = item.replace(/ /g, "").replace(/&mdash;/g, "-").split("|")
            all.push(atrs)

          }

        });

        infos[0].value = `Vida entre ${all[level][2]} e ${all[level][8]}, ATQ entre ${all[level][3]} e ${all[level][9]}, DEF entre ${all[level][4]} e ${all[level][10]}, e ${pitagoras[6].split("<")[0].replace(/%/g, "")} de ${all[level][5]}.`;

      }

      embed.fields = infos;

      let buttons1 = new disbut.MessageActionRow();
      let buttons2 = new disbut.MessageActionRow();
      const labelsTypes = ["Ascensão 0", "Ascensão 1", "Ascensão 2", "Ascensão 3", "Ascensão 4", "Ascensão 5", "Ascensão 6/MAX"].slice(0, (array.length + 1))

      for (i = 0; i < labelsTypes.length; i++) {

        let j = 0;
        if (labelsTypes[i].split(" ")[1][0] == level) j = 1;

        if (i > Math.floor(labelsTypes.length / 2)) {

          buttons2.addComponents(

            new disbut.MessageButton()
              .setStyle(['grey', 'blurple'][j])
              .setLabel(labelsTypes[i])
              .setID("6_" + labelsTypes[i])

          );

        } else {

          buttons1.addComponents(

            new disbut.MessageButton()
              .setStyle(['grey', 'blurple'][j])
              .setLabel(labelsTypes[i])
              .setID("6_" + labelsTypes[i])

          );

        }

      }

      if (edit) { message.edit({ embed: embed, components: [buttons1, buttons2] }).then(interaction.reply.defer()); }
      else { message.channel.send("<@" + message.author.id + ">", { embed: embed, components: [buttons1, buttons2] }); }

    } else {

      message.reply('infelizmente esse item ainda não possui essas informações.');

    }

  }).catch((e) => console.log(`Deu erro, mané! (${name}): ${e}\n\n----------------------\n`));

}

module.exports = { ascension, generateAscension }