"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const lodash = require("lodash");
const axios = require('axios');

async function listArtifacts (message, args, disbut, edit, interaction) {

  const allArtifacts = (await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:Conjunto_de_Artefatos&cmlimit=500&format=json`)).data.query.categorymembers.filter((item) => !item.title.startsWith("Predefinição:")).filter((item) => !item.title.includes("Categoria:")).filter(function(item, pos, self) { return self.indexOf(item) == pos; }).map((item) => item.title);

  let artifacts = [];
 
  if (args[1]) { artifacts = allArtifacts.filter((material) => material.toLowerCase().includes(args[1].toLowerCase())); } else { args[1] = ""}
  if (!artifacts.length) artifacts = allArtifacts

  let pages = lodash.chunk(artifacts.sort(), 20);
  
  if (isNaN(parseInt(args[0]))) args[0] = 1;
  if (parseInt(args[0]) > pages.length) args[0] = pages.length

  let alchemyList = new discordjs.MessageEmbed()
  .setTitle("Lista de Artefatos")
  .setDescription("")
  .setColor('#0099ff')
  .setFooter(`Página ${args[0]}/${pages.length}`)

  let next = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('▶️')
  .setID("3_" + (parseInt(args[0]) + 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  let previous = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('◀️')
  .setID("3_" + (parseInt(args[0]) - 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  if (parseInt(args[0]) != pages.length) { alchemyList.footer.text += ` — Use !artefatos-list ${parseInt(args[0]) + 1}_${args[1]} para ir para a próxima página.`.replace("_ para ir para a próxima página.", " para ir para a próxima página."); next.setDisabled(false); }
  if (parseInt(args[0]) > 1) previous.setDisabled(false);

  pages[args[0] - 1].forEach(item => {

    alchemyList.setDescription(alchemyList.description += item + "\n") 

  })

  if (edit) {message.edit({embed: alchemyList, components: [previous, next]}).then(interaction.reply.defer());}
  else {message.channel.send("<@" + message.author.id + ">", {embed: alchemyList, components: [previous, next]});}

}

async function artifact (message, args, disbut, edit, interaction) {

  let name = args[0].toLowerCase();
  let infos = [];
  let labels, ptLabels;
  let already = false;

  const singleArtifacts = ["general", "flower", "plume", "sands", "goblet", "circlet"];
  let optionsArtifacts = [["Informações Gerais"], ["general"]];

  if (!args[1]) args[1] = "general";
  if (!singleArtifacts.includes(args[1].toLowerCase())) args[1] = "general";

  let res = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=opensearch&search=${encodeURIComponent(name)}&limit=10&namespace=0&format=json`);
  let fixedName = res.data[3][res.data[1].findIndex((item) => item.toLowerCase() == name)]

  if (fixedName) {

    fixedName = fixedName.substr(45);

    axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${fixedName}&rvprop=content&format=json`).then((res) => {
      
      let materialInfo = new discordjs.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(Object.values(res.data.query.pages)[0].title)
      .setAuthor(Object.values(res.data.query.pages)[0].title)
      .setDescription("Artefatos: ");

      labels = ["flower", "flower_short", "flower_long", "plume", "plume_short", "plume_long", "sands", "sands_short", "sands_long", "goblet", "goblet_short", "goblet_long", "circlet", "circlet_short", "circlet_long", "1pcBonus", "2pcBonus", "3pcBonus", "4pcBonus", "\u200b", "source1.1", "source1.2", "source1.3", "source2.1", "source2.2", "source2.3", "source3.1", "source3.2", "source3.3", "source4.1", "source4.2", "source4.3", "source5.1", "source5.2", "source5.3"]; 
      ptLabels = ["Flor da Vida", "Descrição", "História", "Pluma da Morte", "Descrição", "História", "Areia do Tempo", "Descrição", "História", "Cálice de Erátema", "Descrição", "História", "Tiara de Logos", "Descrição", "História", "Bônus de 1 Peça", "Bônus de 2 Peças", "Bônus de 3 Peças", "Bônus de 4 Peças", "\u200b", "[1★] - Fonte 1", "[1★] - Fonte 2", "[1★] - Fonte 3", "[2★] - Fonte 1", "[2★] - Fonte 2", "[2★] - Fonte 3", "[3★] - Fonte 1", "[3★] - Fonte 2", "[3★] - Fonte 3", "[4★] - Fonte 1", "[4★] - Fonte 2", "[4★] - Fonte 3", "[5★] - Fonte 1", "[5★] - Fonte 2", "[5★] - Fonte 3"];

      if (Object.values(res.data.query.pages)[0].revisions != undefined) {

        let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{).*?\|termo=(.*?)\|.*?(?<=}})|(?={{).*?\|termo=(.*?)}}(?<=}})/gi, "$1$2").replace(/{{Electro}}/g, "Electro").replace(/{{Pyro}}/g, "Pyro").replace(/{{Cryo}}/g, "Cryo").replace(/{{Ameno}}/g, "Anemo").replace(/{{Geo}}/g, "Geo").replace(/{{Hydro}}/g, "Hydro").replace(/ \| /g, "|").replace(/(\w)\|(\w)/g, "$1/$2").replace(/<ref .*?> ?(.*?) ?<\/ref>/g, " ($1) ").split("|")
        array.splice(0, 1)
        array.forEach((item, index) => {
          
          item = item.split("=");
          item[0] = item[0].replace(/ /g, "");
          if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").replace(/\*/g, "\n• ").replace(/&nbsp;/g, "-").replace(/& ?mdash;/g, "—").replace(/<\/?poem>/g, "").replace(/<\/?p>/g, "").replace(/,,/g, ",").replace(/;,/g, ";").replace(/(.[\.\,\?\!])(.)/g, "$1 $2").replace(/  /g, " ").replace(/""/g, '"').replace(/(.)\. \.\.(.)/g, "$1... $2").replace(/\. ",/g, '.",').replace(/  /g, " ").replace(/{{w\/(.*?)}}/g, "$1").split("}")[0].split("<ref>")[0];

          if (labels.indexOf(item[0]) > -1 && item[1] != "undefined" && item[1] != "" && item[1] != " " && item[1] != undefined && item[1] != " undefined") {

            if (singleArtifacts.includes(item[0]) && !optionsArtifacts[0].includes(ptLabels[labels.indexOf(item[0])])) {
              optionsArtifacts[0].push(ptLabels[labels.indexOf(item[0])]); 
              optionsArtifacts[1].push(item[0]);
            }

            if (item[0].startsWith("source") && args[1].toLowerCase() == "general") {

              infos.push({ name: "\u200b", value: '**Como obter?**', inline: false });
              infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });

            } else if (item[0].endsWith("Bonus") && args[1].toLowerCase() == "general") {

              infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });
            
            } else if (args[1].toLowerCase() != "general" && item[0].startsWith(args[1].toLowerCase())) {

              if (ptLabels[labels.indexOf(item[0])] == "Descrição") {

                materialInfo.setDescription(item[1]);
                
              } else if (ptLabels[labels.indexOf(item[0])] == "História") {

                if (item[1].length >= 1024) item[1] = item[1].substr(0, 1020) + "..."

                infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: false });
                
              } else {
                
                if (!materialInfo.thumbnail) materialInfo.setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Item_${encodeURIComponent(item[1].replace(/ /g, "_"))}.png`);
                materialInfo.setTitle(item[1]);
                infos.push({ name: "Atributo Principal", value: {"flower": "Vida", "plume": "ATQ", "sands": "Vida%, DEF%, ATQ%, Proficiência Elemental, ou Recarga de Energia", "goblet": " Vida%, DEF%, ATQ%, Proficiência Elemental, ou Bônus de Dano% Físico/Hydro/Pyro/Cryo/Electro/Anemo/Geo.", "circlet": "Vida%, DEF%, ATQ%, Proficiência Elemental, Taxa Crítica%, Dano Crítico%, ou Bônus de Cura%"}[item[0]], inline: false})
                
              }

            } else if (args[1].toLowerCase() == "general" && !materialInfo.description.includes(item[1]) && singleArtifacts.includes(item[0])) {

              materialInfo.description += item[1] + ",";
              
            }

          }

        });

        //console.log(Object.values(res.data.query.pages)[0].revisions[0]["*"].replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{Color).*?(\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{).*?\|termo=(.*?)\|.*?(?<=}})|(?={{).*?\|termo=(.*?)}}(?<=}})/gi, "$1$2").replace(/{{Electro}}/g, "Electro").replace(/{{Pyro}}/g, "Pyro").replace(/{{Cryo}}/g, "Cryo"))

        infos = infos.filter((obj, pos, arr) => {

          return arr.map(mapObj =>
                mapObj.name).indexOf(obj.name) == pos;

        });
        
        infos.sort(function (a, b) {
            return ptLabels.indexOf(a.name) - ptLabels.indexOf(b.name);
        });

        materialInfo.setURL("https://genshin-impact.fandom.com/pt-br/wiki/" + fixedName);
        materialInfo.fields = infos;
        materialInfo.description = materialInfo.description.replace(/(Artefatos:.*),/g, "$1").replace(/  /g, " ");
        
        let buttons1 = new disbut.MessageActionRow();
        let buttons2 = new disbut.MessageActionRow();
  
        for (let i = 0; i < optionsArtifacts[0].length; i++) {
  
          let j = 0;
          if (optionsArtifacts[1][i] == args[1].toLowerCase()) j = 1;
  
          if (i > 2) {
  
            buttons2.addComponents(
  
              new disbut.MessageButton()
                .setStyle(['grey', 'blurple'][j])
                .setLabel(optionsArtifacts[0][i])
                .setID("10_" + optionsArtifacts[1][i])
  
            );
  
          } else {
  
            buttons1.addComponents(
  
              new disbut.MessageButton()
                .setStyle(['grey', 'blurple'][j])
                .setLabel(optionsArtifacts[0][i])
                .setID("10_" + optionsArtifacts[1][i])
  
            );
  
          }
  
        }

        let buttonsArray = [buttons1];
        if (buttons2.components[0]) buttonsArray.push(buttons2);
        
        if (edit) { message.edit({ embed: materialInfo, components: buttonsArray }).then(interaction.reply.defer()); }
        else { message.channel.send("<@" + message.author.id + ">", { embed: materialInfo, components: buttonsArray }); }

      } else {

        message.reply("esse conjunto de artefato não existe ou não está cadastrado.");

      }

    }).catch((e) => console.log(`Deu erro, mané! (${args}): ${e}\n\n----------------------\n`));

  } else {

    message.reply("esse conjunto de artefato não existe ou não está cadastrado.");

  }

}

module.exports = {listArtifacts, artifact}