"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const lodash = require("lodash");
const axios = require('axios');

async function listForges (message, args, disbut, edit, interaction) {

  const allForges = (await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:Forjamento&cmlimit=500&format=json`)).data.query.categorymembers.filter((item) => !item.title.startsWith("Predefinição:")).filter((item) => !item.title.includes("Categoria:")).filter(function(item, pos, self) { return self.indexOf(item) == pos; }).map((item) => item.title);
  
  let forges = [];
  
  if (args[1]) { forges = allForges.filter((material) => material.toLowerCase().includes(args[1].toLowerCase())); } else { args[1] = ""}
  if (!forges.length) forges = allForges

  let pages = lodash.chunk(forges.sort(), 20);
  
  if (isNaN(parseInt(args[0]))) args[0] = 1;
  if (parseInt(args[0]) > pages.length) args[0] = pages.length

  let forgeList = new discordjs.MessageEmbed()
  .setTitle("Lista de Forjamento")
  .setDescription("")
  .setColor('#0099ff')
  .setFooter(`Página ${args[0]}/${pages.length}`)

  let next = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('▶️')
  .setID("4_1_" + (parseInt(args[0]) + 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  let previous = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('◀️')
  .setID("4_1_" + (parseInt(args[0]) - 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  if (parseInt(args[0]) != pages.length) { forgeList.footer.text += ` — Use !forjamentos-list ${parseInt(args[0]) + 1}_${args[1]} para ir para a próxima página.`.replace("_ para ir para a próxima página.", " para ir para a próxima página."); next.setDisabled(false); }
  if (parseInt(args[0]) > 1) previous.setDisabled(false);

  pages[args[0] - 1].forEach(item => {

    forgeList.setDescription(forgeList.description += item + "\n") 

  })

  if (edit) {message.edit({embed: forgeList, components: [previous, next]}).then(interaction.reply.defer());}
  else {message.channel.send("<@" + message.author.id + ">", {embed: forgeList, components: [previous, next]});}

}

async function forge (message, args) {

  let name = args[0].toLowerCase();
  let infos = [];
  let labels, ptLabels;
  let noBtns = false;
  
  let res = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=opensearch&search=${encodeURIComponent(name)}&limit=10&namespace=0&format=json`);
  let fixedName = res.data[3][res.data[1].findIndex((item) => item.toLowerCase() == name)]

  if (fixedName) {

    fixedName = fixedName.substr(45);

    axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${fixedName}&rvprop=content&format=json`).then((res) => {
      
      if (Object.values(res.data.query.pages)[0].revisions != undefined) {

        let recipeInfo = new discordjs.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(Object.values(res.data.query.pages)[0].title)
        .setDescription("")
        .setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Arma_${fixedName}.png`)

        let labels = ["rarity", "type", "series", "base_atk", "2nd_stat_type", "2nd_stat", "image"]; 
        let ptLabels = ["Raridade", "Tipo", "Série", "ATQ Básico (Nível.1)", "Tipo de Atributo Secundário", "Valor do Atributo Secundário (Nível.1)", "image"];

        let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{).*?\|termo=(.*?)\|.*?(?<=}})|(?={{).*?\|termo=(.*?)}}(?<=}})/gi, "$1$2").split("|");

        if (Object.values(res.data.query.pages)[0].revisions[0]["*"].match(/{{(.*?) Infobox/)[1] == "Item") recipeInfo.setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Item_${fixedName}.png`)
        
        array.splice(0, 1)
        array.forEach((item) => {
          
          item = item.split("=");
          item[0] = item[0].replace(/ /g, "");
          if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").split("}")[0].split("<ref>")[0];

          if (item[0] == "image") {
            
            recipeInfo.setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/${item[1].replace(/.*< ?gallery ?>/g, "").replace(/ /g, "_")}`);
            
          } else if (labels.indexOf(item[0]) > -1 && item[1] != "undefined" && item[1] != "" && item[1] != " " && item[1] != undefined && item[1] != " undefined") {

            infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });

          }

        });

        infos = infos.filter((obj, pos, arr) => {

          return arr.map(mapObj =>
                mapObj.name).indexOf(obj.name) == pos;

        });
        
        infos.sort(function (a, b) {
            return ptLabels.indexOf(a.name) - ptLabels.indexOf(b.name);
        });

        recipeInfo.setURL("https://genshin-impact.fandom.com/pt-br/wiki/" + fixedName);
        recipeInfo.fields = infos;

        const badNames2 = ["sort", "type", "character", "time"]
        Object.values(res.data.query.pages)[0].revisions[0]["*"].match(/{{Recipe(.|\n)*?}}/g).forEach(recipe => {

          recipeInfo.description += "\n"

          let array2 = recipe.replace("{{Recipe", "").replace("}}", "").replace(/\n/g, "").split("|");
          array2.splice(0, 1)
          
          array2.forEach((item) => {

            item = item.split("=");
            if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").split("}")[0].split("<ref>")[0];

            if (item[0].replace(/ /g, "") == "time") recipeInfo.description += "Tempo: " + item[1] + "\n"
            if (badNames2.indexOf(item[0].replace(/ /g, "")) == -1) recipeInfo.description += item[1] + "x " + item[0] + "\n"

          })

        })

        message.reply(recipeInfo);

      } else {

        message.reply("esse forjamento não existe ou não está cadastrado.");
        console.log(`Deu erro, mané! (${name}) (${fixedName})`)

      }

    }).catch((e) => {message.reply("esse forjamento não existe ou não está cadastrado."); console.log(`Deu erro, mané! (${name}): ${e}\n\n----------------------\n`)});

  } else {

    message.reply("esse forjamento não existe ou não está cadastrado.");

  }

}

module.exports = {listForges, forge}