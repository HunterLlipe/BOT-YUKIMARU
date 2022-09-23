"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const lodash = require("lodash");
const axios = require('axios');

async function list (message, args, disbut, db, edit, interaction) {
try {
  const allMaterials = await db.get("materials");
  let materials = [];

  if (args[1]) { materials = allMaterials.filter((material) => material.toLowerCase().includes(args[1].toLowerCase())); } else { args[1] = "" }
  if (!materials.length) materials = allMaterials

  let pages = lodash.chunk(materials.sort(), 20);
  
  if (isNaN(parseInt(args[0]))) args[0] = 1;
  if (parseInt(args[0]) > pages.length) args[0] = pages.length
  
  let materialList = new discordjs.MessageEmbed()
  .setTitle("Lista de Materiais")
  .setDescription("")
  .setColor('#0099ff')
  .setFooter(`Página ${args[0]}/${pages.length}`)

  let next = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('▶️')
  .setID("2_" + (parseInt(args[0]) + 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  let previous = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('◀️')
  .setID("2_" + (parseInt(args[0]) - 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  if (parseInt(args[0]) != pages.length) { materialList.footer.text += ` — Use !material-list ${parseInt(args[0]) + 1}_${args[1]} para ir para a próxima página.`.replace("_ para ir para a próxima página.", " para ir para a próxima página."); next.setDisabled(false); }
  if (parseInt(args[0]) > 1) previous.setDisabled(false);

  pages[parseInt(args[0]) - 1].forEach(item => {

    materialList.setDescription(materialList.description += item + "\n") 

  })

  if (edit) {message.edit({embed: materialList, components: [previous, next]}).then(interaction.reply.defer());}
  else {message.channel.send("<@" + message.author.id + ">", {embed: materialList, components: [previous, next]});}
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

async function material (message, args, db) {
try {
  let infos = [];
  const materials = await db.get("materials");

  let name = materials.sort().find(material => material.toLowerCase() == args[0].toLowerCase());
  
  if (name) {

    axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${encodeURIComponent(name.replace(/ /g, "_"))}&rvprop=content&format=json`).then((res) => {

      let materialInfo = new discordjs.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(Object.values(res.data.query.pages)[0].title)
      .setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Especial:Redirecionar/file/Item_${name.replace(/ /g, "_")}.png`) 
      .setURL("https://genshin-impact.fandom.com/pt-br/wiki/" + encodeURIComponent(name.replace(/ /g, "_")));
      
      let labels = ["description", "rarity", "type", "invCategory", "\u200b", "source1", "source2", "source3", "source4", "source5", "source6", "source7", "source8", "source9", "source10", "image"]; 
      let ptLabels = ["Descrição", "Raridade", "Tipo de Item", "Categoria no Inventário", "\u200b", "Fonte 1", "Fonte 2", "Fonte 3", "Fonte 4", "Fonte 5", "Fonte 6", "Fonte 7", "Fonte 8", "Fonte 9", "Fonte 10", "image"];
  
      if (Object.values(res.data.query.pages)[0].revisions != undefined) {
  
        let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].replace(/(\w)\|(\w)/g, "$1/$2").replace(/{{Sold By}}/g, "Vendido em certas lojas").split("|")
        array.splice(0, 1)
        array.forEach((item) => {
          
          item = item.split("=");
          item[0] = item[0].replace(/ /g, "");
          if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").replace(/\*/g, "\n• ").split("}")[0].split("<ref>")[0];
  
          if (labels.indexOf(item[0]) > -1 && item[1] != "undefined" && item[1] != "" && item[1] != " " && item[1] != undefined && item[1] != " undefined") {
  
            if (item[0] == "description") {

              if (item[1].length >= 1024) item[1] = item[1].substr(0, 1020) + "..."
  
              infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: false });
  
            } else if (item[0].startsWith("source")) {
  
              infos.push({ name: "\u200b", value: '**Como obter?**', inline: false });
              infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });
  
            } else if (item[0] == "image") {
  
              materialInfo.setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/${item[1].replace(/.*< ?gallery ?>/g, "").replace(/ /g, "_").split("/")[0]}`);
            
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
  
        materialInfo.fields = infos;
        message.reply(materialInfo);
  
      } else {
  
        message.reply("esse material não existe ou não está cadastrado.");
  
      }
  
    }).catch((e) => console.log(`Deu erro, mané! (${args}): ${e}\n\n----------------------\n`));
  
  } else {

    message.reply("material não informado, inexistente ou não cadastrado.")
    
  }
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

module.exports = {list, material};