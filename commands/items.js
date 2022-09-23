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
  let res = await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=opensearch&search=${encodeURIComponent(args[0].toLowerCase())}&limit=10&namespace=0&format=json`); 
  let link = res.data[3][res.data[1].findIndex((item) => item.toLowerCase() == args[0].toLowerCase())]
  let data;

  if (!item && link) {

    data = Object.values((await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${link.substr(45)}&rvprop=content&format=json`)).data.query.pages)[0].revisions

    if (data) {

      item = {"name": res.data[1].find((item) => item.toLowerCase() == args[0].toLowerCase()), "type": "none", "photo": (await axios.get("https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/" + encodeURIComponent(data[0]["*"].replace(/\n/g, " ").match(/image ?= ?(.*?)\|/)[1].replace(/.*<gallery ?.*?> ?/, "")))).request._redirectable._options.href, "level": parseInt(data[0]["*"].replace(/\n/g, "").match(/rarity.*?= ?(.*?)\|/)[1])};

    }

  }

  if (item && link) {

    let itemlisted = new discordjs.MessageEmbed()
    .setTitle(global.capitalize(item.name))
    .setDescription(["Arma", "Personagem", " Não cadastrado no bot"][["weapon", "character", "none"].indexOf(item.type)])
    .setURL("https://genshin-impact.fandom.com/pt-br/wiki/" + link.substr(45));
    
    if (item.photo != "") {
      
      let palette = await nodevibrant.from(item.photo).getPalette()
      itemlisted.setImage(item.photo);
      itemlisted.setColor(rgb2hex(`rgb(${parseInt(palette.Vibrant._rgb[0])},${parseInt(palette.Vibrant._rgb[1])},${parseInt(palette.Vibrant._rgb[2])})`).hex);

    }
    
    if (item.type == "character") itemlisted.setFooter(`Dica: Use ${[`!talentos ${global.capitalize(args[0])} para ver os talentos`, `!constelações ${global.capitalize(args[0])} para ver as constelações`, `!ascensões ${global.capitalize(args[0])} para ver as ascensões e atributos`][Math.floor(Math.random() * 3)]} do personagem.`);
    if (item.type == "weapon") itemlisted.setFooter(`Dica: Use ${[`!ascensões ${global.capitalize(args[0])} para ver as ascensões`, `!refinamentos ${global.capitalize(args[0])} para ver os refinamentos da passiva`][Math.floor(Math.random() * 2)]} da arma.`);

    generateInfos(item.type, item.level, itemlisted, message, link.substr(45));
  
  } else if (item && !link) {

    let itemlisted = new discordjs.MessageEmbed()
    .setTitle(global.capitalize(item.name))
    .setDescription(["Arma", "Personagem"][["weapon", "character"].indexOf(item.type)] + "\n\n Infelizmente esse item ainda não possui informações completas.")
    .addField("Raridade", item.level);
    
    if (item.photo != "") {
      
      let palette = await nodevibrant.from(item.photo).getPalette()
      itemlisted.setImage(item.photo);
      itemlisted.setColor(rgb2hex(`rgb(${parseInt(palette.Vibrant._rgb[0])},${parseInt(palette.Vibrant._rgb[1])},${parseInt(palette.Vibrant._rgb[2])})`).hex);

    }

    message.reply(itemlisted);
    
  } else {

    message.reply('Item inexistente ou não informado.');

  }
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}


async function generateInfos (type, i, embed, message, name) {

  let infos = [{ name: 'Raridade', value: i, inline: true }];
  let variables = [];

  if (name == "Hu_Tao") name = "Hutao"

  axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${name}&rvprop=content&format=json`).then((res) => {

    let labels = ["type", "series", "passive", "effect", "base_atk", "2nd_stat_type", "2nd_stat", "eff_rank1_var1", "eff_rank1_var2", "eff_rank1_var3", "weapon", "element", "sex", "birthday", "constellation", "region", "affiliation", "dish", "releaseDate"]; 
    let ptLabels = ["Tipo", "Série", "Passiva", "Habilidade Passiva", "ATQ Básico (Nível.1)", "Tipo de Atributo Secundário", "Valor do Atributo Secundário (Nível.1)", "eff_rank1_var1", "eff_rank1_var2", "eff_rank1_var3", "Arma", "Elemento", "Sexo", "Aniversário", "Constelação", "Nação", "Afiliação", "Prato Especial", "Data de Lançamento"] 

    if (Object.values(res.data.query.pages)[0].revisions != undefined) {

      if (type == "none") {

        if (Object.values(res.data.query.pages)[0].revisions[0]["*"].match(/personagem|arma/i)[0].toLowerCase() == "arma") type = "weapon"
        if (Object.values(res.data.query.pages)[0].revisions[0]["*"].match(/personagem|arma/i)[0].toLowerCase() == "personagem") type = "character"

      }

      let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].replace(/(?={{Color).*?(\|.*?\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{Color).*?(\|.*?\|(.*?))}}(?<=}})/gi, "$2").replace(/(?={{).*?\|termo=(.*?)\|.*?(?<=}})|(?={{).*?\|termo=(.*?)}}(?<=}})/gi, "$1$2").split("|")
      array.splice(0, 1)
      array.forEach((item) => {
        
        item = item.split("=");
        item[0] = item[0].replace(/ /g, "");
        if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\n/g, "").replace(/ <br ?\/? ?>/g, ", ").replace(/<br ?\/? ?>/g, ", ").replace("<!--  x  -->", "").replace("<!--Character Information-->", "").replace(/<!--?-? ?Informações do Personagem--?-? ?>/, "").replace("<!--Titles-->", "").replace("<small>", "").replace("</small>", "").replace("Não faça nenhuma alteração nos dados de gênero (", "").replace(" <!--", ".").split("}")[0].split("<ref>")[0];

        if (item[0] == "series" && item[1] == " " || item[0] == "series" && item[1] == "") item[1] = "Independente";

        if (labels.indexOf(item[0]) > -1) {
          
          if (item[0] == "releaseDate" && !isNaN(Date.parse(item[1]))) { 

            infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true }); 

          } else if (item[0].startsWith("eff_")) {

            variables.push(item[1].replace(/ /g, ""));

          } else if (item[0] == "effect") {
            
            infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });
            infos.push({ name: "\u200b", value: "\u200b", inline: true })

          } else if (item[0] != "releaseDate" && item[1] != "" && item[1] != " " && item[1] != undefined) { 
            
            infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true }); 
            
          }

        }

      });

      infos = infos.filter((obj, pos, arr) => {

        return arr.map(mapObj =>
              mapObj.name).indexOf(obj.name) == pos;

      });
      
      if (type == "weapon") {

        if (Object.values(res.data.query.pages)[0].revisions[0]["*"].includes("Description")) { 
          
          infos.push({ name: "Descrição", value: Object.values(res.data.query.pages)[0].revisions[0]["*"].split("Description")[1].split("}")[0].replace("|", "").replace(/\n/g, "").replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\n/g, " ").replace(/ <br ?\/? ?>/g, ", ").replace(/<br ?\/? ?>/g, ", ").replace(/'/g, "").replace(/&mdash;/g, "—").replace(/  /, " "), inline: false });
          
        } else if (Object.values(res.data.query.pages)[0].revisions[0]["*"].includes("Descrição")) { 
          
          infos.push({ name: "Descrição", value: Object.values(res.data.query.pages)[0].revisions[0]["*"].split("Descrição==")[1].split("=")[0].replace("=", "").replace(/\n/g, "").replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\n/g, " ").replace(/ <br ?\/? ?>/g, ", ").replace(/<br ?\/? ?>/g, ", ").replace(/'/g, "").replace(/&mdash;/g, "—").replace(/  /, " "), inline: false });
          
        }

        const sortOrder = ["Descrição", "Raridade", "Tipo", "Série", "Passiva", "Habilidade Passiva", "\u200b", "ATQ Básico (Nível.1)", "Tipo de Atributo Secundário", "Proficiência Elemental", "Valor do Atributo Secundário (Nível.1)"]
        infos.sort(function (a, b) {
          return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
        });

        let number = 3;

        if (infos[0].name != "Descrição") number = 2;

        if (infos[number].name != "Série") {
          
          infos.push({ name: "Série", value: "Independente", inline: true })
          infos.sort(function (a, b) {
            return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
          });

        }

        infos.filter((item, index) => {
          
          if (item.name == "Habilidade Passiva") {
            
            if (variables.length == 3) infos[index].value = item.value.replace(/\(var1\)/g, variables[0]).replace(/\(var2\)/g, variables[1]).replace(/\(var3\)/g, variables[2]).replace(/ ?<br ? ?\/? ?>/gi, "\n").replace(/: ''/g, ":'' ").replace(/'' /g, "*")
            if (variables.length == 2) infos[index].value = item.value.replace(/\(var1\)/g, variables[0]).replace(/\(var2\)/g, variables[1]).replace(/ ?<br ? ?\/? ?>/gi, "\n").replace(/: ''/g, ":'' ").replace(/'' /g, "*")
            if (variables.length == 1) infos[index].value = item.value.replace(/\(var1\)/g, variables[0]).replace(/ ?<br ? ?\/? ?>/gi, "\n").replace(/: ''/g, ":'' ").replace(/'' /g, "*")

          }
          
        })

      } else {

        if (Object.values(res.data.query.pages)[0].revisions[0]["*"].includes("==Ascens")) {

          let newDescription = Object.values(res.data.query.pages)[0].revisions[0]["*"].split("==Ascens")[0].replace(/==Introdução Oficial==\n{{.*?Introdução Oficial}}/, "").split("}")[Object.values(res.data.query.pages)[0].revisions[0]["*"].split("==Ascens")[0].replace(/==Introdução Oficial==\n{{.*?Introdução Oficial}}/, "").split("}").length - 1].replace(/\n/g, " ").replace(/  /, " ");

          if (newDescription[0] == ",") newDescription = newDescription.replace(",", "");
          if (newDescription[0] == " ") newDescription = newDescription.replace(" ", "");
          newDescription = newDescription.replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/ <br ?\/? ?>/g, ", ").replace(/<br ?\/? ?>/g, ", ").replace(/'/g, "").replace(/&mdash;/g, "—");
          if (newDescription.includes("<ref")) newDescription = newDescription.replace(newDescription.split("<ref")[1].split("ref>")[0], "").replace("<ref", " ").replace("ref>", " ").replace(/  /g, " ").replace(/ \. /g, ". ")
          newDescription = newDescription.charAt(0).toUpperCase() + newDescription.slice(1);

          infos.push({ name: "Descrição", value: newDescription, inline: false })

        }

        const sortOrder = ["Descrição", "Raridade", "Sexo", "Aniversário", "Elemento", "Constelação", "Afiliação", "Nação", "Arma", "Prato Especial", "Data de Lançamento"]
        infos.sort(function (a, b) {
          return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
        });

      }
        
      infos = infos.filter(e => !!e.value);
      embed.fields = infos;
      message.reply(embed);

    } else {

      infos = infos.filter(e => !!e.value);
      embed.fields = infos;
      message.reply(embed);

    }

  });

}

module.exports = {list, info}