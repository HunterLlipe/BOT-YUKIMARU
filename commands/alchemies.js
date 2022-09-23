"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const lodash = require("lodash");
const axios = require('axios');

async function listAlchemies (message, args, disbut, edit, interaction) {

  const allAlchemies = (await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:Convers%C3%A3o&cmlimit=500&format=json`)).data.query.categorymembers.filter((item) => !item.title.startsWith("Predefinição:")).filter(function(item, pos, self) { return self.indexOf(item) == pos; }).map((item) => item.title).concat((await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:S%C3%ADntese&cmlimit=500&format=json`)).data.query.categorymembers.filter((item) => !item.title.startsWith("Predefinição:")).filter(function(item, pos, self) { return self.indexOf(item) == pos; }).map((item) => item.title)).filter(function(item, pos, self) { return self.indexOf(item) == pos; });

  let alchemies = [];
 
  if (args[1]) { alchemies = allAlchemies.filter((material) => material.toLowerCase().includes(args[1].toLowerCase())); } else { args[1] = ""}
  if (!alchemies.length) alchemies = allAlchemies

  let pages = lodash.chunk(alchemies.sort(), 20);
  
  if (isNaN(parseInt(args[0]))) args[0] = 1;
  if (parseInt(args[0]) > pages.length) args[0] = pages.length

  let alchemyList = new discordjs.MessageEmbed()
  .setTitle("Lista de Alquimias")
  .setDescription("")
  .setColor('#0099ff')
  .setFooter(`Página ${args[0]}/${pages.length}`)

  let next = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('▶️')
  .setID("4_2_" + (parseInt(args[0]) + 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  let previous = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('◀️')
  .setID("4_2_" + (parseInt(args[0]) - 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  if (parseInt(args[0]) != pages.length) { alchemyList.footer.text += ` — Use !alquimias-list ${parseInt(args[0]) + 1}_${args[1]} para ir para a próxima página.`.replace("_ para ir para a próxima página.", " para ir para a próxima página."); next.setDisabled(false); }
  if (parseInt(args[0]) > 1) previous.setDisabled(false);

  pages[args[0] - 1].forEach(item => {

    alchemyList.setDescription(alchemyList.description += item + "\n") 

  })

  if (edit) {message.edit({embed: alchemyList, components: [previous, next]}).then(interaction.reply.defer());}
  else {message.channel.send("<@" + message.author.id + ">", {embed: alchemyList, components: [previous, next]});}

}

async function alchemy (message, args) {

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

        let alchemyInfo = new discordjs.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(Object.values(res.data.query.pages)[0].title)
        .setDescription("")
        .setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Item_${fixedName}.png`)

        labels = ["description", "rarity", "type", "type2", "type3", "invCategory", "group", "effect", "reusable", "usage", "commemorative", "\u200b", "source1", "source2", "source3", "source4", "source5", "source6", "source7", "source8", "source9", "source10", "image"]; 
        ptLabels = ["Descrição", "Raridade", "Tipo", "Tipo 2", "Tipo 3", "Categoria no Inventário", "Grupo", "Efeito", "Reutilizável", "Uso", "Comemorativo", "\u200b", "Fonte 1", "Fonte 2", "Fonte 3", "Fonte 4", "Fonte 5", "Fonte 6", "Fonte 7", "Fonte 8", "Fonte 9", "Fonte 10", "image"];

        let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{).*?\|termo=(.*?)\|.*?(?<=}})|(?={{).*?\|termo=(.*?)}}(?<=}})/gi, "$1$2").replace(/(\w)\|(\w)/g, "$1/$2").split("|")

        array.splice(0, 1)
        array.forEach((item) => {
          
          item = item.split("=");
          item[0] = item[0].replace(/ /g, "");
          if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").replace(/\*/g, "\n• ").split("}")[0].split("<ref>")[0];

          if (labels.indexOf(item[0]) > -1 && item[1] != "undefined" && item[1] != "" && item[1] != " " && item[1] != undefined && item[1] != " undefined") {

            if (item[0] == "description") {

              if (item[1].length >= 1024) item[1] = item[1].substr(0, 1020) + "..."

              infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: false });
              noBtns = true;

            } else if (item[0] == "image") {

              alchemyInfo.setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/${item[1].replace(/.*< ?gallery ?>/g, "").replace(/ /g, "_")}`)
            
            } else if (item[0].startsWith("source")) {

              infos.push({ name: "\u200b", value: '**Como obter?**', inline: false });
              infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });

            } else {
            
              infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });

            }

          }

        });

        infos = infos.filter((obj, pos, arr) => {

          return arr.map(mapObj =>
                mapObj.name).indexOf(obj.name) == pos;

        });
        
        infos.sort(function (a, b) {
            return ptLabels.indexOf(a.name) - ptLabels.indexOf(b.name);
        });

        alchemyInfo.setURL("https://genshin-impact.fandom.com/pt-br/wiki/" + fixedName);
        alchemyInfo.fields = infos;

        const badNames2 = ["sort", "type", "character", "time"]
        Object.values(res.data.query.pages)[0].revisions[0]["*"].match(/{{Recipe(.|\n)*?}}/g).forEach(recipe => {

          alchemyInfo.description += "\n"

          let array2 = recipe.replace("{{Recipe", "").replace("}}", "").replace(/\n/g, "").split("|");
          array2.splice(0, 1)
          
          array2.forEach((item) => {

            item = item.split("=");
            if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").split("}")[0].split("<ref>")[0];

            if (item[0].replace(/ /g, "") == "type") alchemyInfo.description += "**" + item[1] + "**\n"
            if (badNames2.indexOf(item[0].replace(/ /g, "")) == -1) alchemyInfo.description += item[1] + "x " + item[0] + "\n"

          })

        })

        message.reply(alchemyInfo);

      } else {

        message.reply("essa alquimia não existe ou não está cadastrada.");
        console.log(`Deu erro, mané! (${name}) (${fixedName})`)

      }

    }).catch((e) => {message.reply("essa alquimia não existe ou não está cadastrada."); console.log(`Deu erro, mané! (${name}): ${e}\n\n----------------------\n`)});
  
  } else {

    message.reply("esse alquimia não existe ou não está cadastrado.");

  }

}

module.exports = {listAlchemies, alchemy}