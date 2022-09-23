"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const lodash = require("lodash");
const axios = require('axios');

async function listRecipes (message, args, disbut, edit, interaction) {
try {
  const allRecipes = (await axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:Alimentos_com_Receita&cmlimit=500&format=json`)).data.query.categorymembers.filter(function(item, pos, self) { return self.indexOf(item) == pos; }).map((item) => item.title);

  let recipes = [];
 
  if (args[1]) { recipes = allRecipes.filter((material) => material.toLowerCase().includes(args[1].toLowerCase())); } else { args[1] = ""}
  if (!recipes.length) recipes = allRecipes

  let pages = lodash.chunk(recipes.sort(), 20);
  
  if (isNaN(parseInt(args[0]))) args[0] = 1;
  if (parseInt(args[0]) > pages.length) args[0] = pages.length

  let recipeList = new discordjs.MessageEmbed()
  .setTitle("Lista de Receitas")
  .setDescription("")
  .setColor('#0099ff')
  .setFooter(`Página ${args[0]}/${pages.length}`)

  let next = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('▶️')
  .setID("4_0_" + (parseInt(args[0]) + 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  let previous = new disbut.MessageButton()
  .setStyle('grey')
  .setEmoji('◀️')
  .setID("4_0_" + (parseInt(args[0]) - 1) + "_" + args[1].toLowerCase())
  .setDisabled(true);

  if (parseInt(args[0]) != pages.length) { recipeList.footer.text += ` — Use !receitas-list ${parseInt(args[0]) + 1}_${args[1]} para ir para a próxima página.`.replace("_ para ir para a próxima página.", " para ir para a próxima página."); next.setDisabled(false); }
  if (parseInt(args[0]) > 1) previous.setDisabled(false);

  pages[args[0] - 1].forEach(item => {

    recipeList.setDescription(recipeList.description += item + "\n") 

  })

  if (edit) {message.edit({embed: recipeList, components: [previous, next]}).then(interaction.reply.defer());}
  else {message.channel.send("<@" + message.author.id + ">", {embed: recipeList, components: [previous, next]});}
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

async function recipe (message, args, edit, disbut, interaction) {
try {
  let type = "";
  let name = "";
  if (args[0]) name = args[0].toLowerCase();
  if (args[1]) type = args[1].toLowerCase();

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
        .setAuthor(Object.values(res.data.query.pages)[0].title)
        .setDescription("")
        .setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Item_${fixedName}.png`)

        const buttonsLabelsIDs = [["general", "basic", "delicious", "suspicious"], ["Informações Gerais", "Normal", "Deliciosa", "Esquisita"]]
        if (buttonsLabelsIDs[0].indexOf(type.toLowerCase()) == -1) type = "general";

        let buttons1 = new disbut.MessageActionRow();

        for (let i = 0; i < 4; i++) {

          let j = 0;
          if (buttonsLabelsIDs[0][i] == type) j = 1;

          buttons1.addComponents(

            new disbut.MessageButton()
            .setStyle(['grey', 'blurple'][j])
            .setLabel(buttonsLabelsIDs[1][i]) 
            .setID("7_" + buttonsLabelsIDs[0][i])

          );

        }

        if (type == "general") {

          labels = ["description", "rarity", "effect", "type", "effectType", "proficiency", "variant", "base", "character", "event", "\u200b", "source1", "source2", "source3", "source4", "source5", "source6", "source7", "source8", "source9", "source10"]; 
          ptLabels = ["Descrição", "Raridade", "Efeito", "Tipo", "Tipo de Efeito", "Proficiência", "Variação", "Base", "Personagem", "Evento", "\u200b", "Fonte 1", "Fonte 2", "Fonte 3", "Fonte 4", "Fonte 5", "Fonte 6", "Fonte 7", "Fonte 8", "Fonte 9", "Fonte 10"];

          let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].split("|")
          array.splice(0, 1)
          array.forEach((item) => {
            
            item = item.split("=");
            item[0] = item[0].replace(/ /g, "");
            if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").replace(/<!--undefined/g, "").replace(/:,/g, ":").replace(/<ref .*?> ?(.*?) ?<\/ref>/g, " ($1) ").split("}")[0].split("<ref>")[0];

            if (labels.indexOf(item[0]) > -1 && item[1] != "undefined" && item[1] != "" && item[1] != " " && item[1] != undefined && item[1] != " undefined") {

              if (item[0] == "description") {

                infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: false });
                noBtns = true;

              } else if (item[0] == "effect") {

                if (!item[1].includes("(var")) infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });
              
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

          recipeInfo.setURL("https://genshin-impact.fandom.com/pt-br/wiki/" + fixedName);
          recipeInfo.fields = infos;

          let array2 = Object.values(res.data.query.pages)[0].revisions[0]["*"].split("{{Recipe")[1].split("}}")[0].split("|")
          const badNames2 = ["sort", "type", "character", "time"]
          array2.splice(0, 1)
          array2.forEach((item) => {
            
            item = item.split("=");
            if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").split("}")[0].split("<ref>")[0];

            if (badNames2.indexOf(item[0].replace(/ /g, "")) == -1) recipeInfo.description += item[1] + "x " + item[0] + "\n"

          });


          let send = {embed: recipeInfo, components: [buttons1]}
          if (noBtns == true) send = {embed: recipeInfo};

          if (edit) {message.edit(send).then(interaction.reply.defer());}
          else {message.channel.send("<@" + message.author.id + ">", send);}

        } else {

          labels = [`desc_${type}`, `eff_${type}1`, `eff_${type}2`, `eff_${type}3`, `name_${type}`, "effect",]; 
          ptLabels = ["Descrição", `eff_${type}1`, `eff_${type}2`, `eff_${type}3`, `name_${type}`, "Efeito"];

          let variables = [];

          let array = Object.values(res.data.query.pages)[0].revisions[0]["*"].split("|")
          array.splice(0, 1)
          array.forEach((item) => {
            
            item = item.split("=");
            item[0] = item[0].replace(/ /g, "");
            if (item[1] != undefined) item[1] = item[1].replace(/\[\[/g, "").replace(/\]\]/g, "").replace("{{Sold By", "undefined").replace(/\n/g, "").replace(/ <br>/g, ", ").replace(/<br>/g, ", ").replace(/\.,/g, ".").replace(/<br ?\/ ?>/g, " ").replace("<small>", "").replace("</small>", "").replace(" <!--", ".").split("}")[0].split("<ref>")[0];

            if (labels.indexOf(item[0]) > -1 && item[1] != "undefined" && item[1] != "" && item[1] != " " && item[1] != undefined && item[1] != " undefined") {

              if (item[0].startsWith("desc_")) {

                infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: false });

              } else if (item[0].startsWith("name_")) {

                recipeInfo.setThumbnail(`https://genshin-impact.fandom.com/pt-br/wiki/Special:Redirect/file/Item_${item[1].replace(/ /g, "_")}.png`)
                recipeInfo.setTitle(item[1])

              } else if (item[0].startsWith("eff_")) {

                variables.push(item[1])
              
              } else {
              
                infos.push({ name: ptLabels[labels.indexOf(item[0])], value: item[1], inline: true });

              }

            }

          });

          infos.map((item, index) => infos[index].value = item.value.replace(/\(var1\)/g, variables[0]).replace(/\(var2\)/g, variables[1]).replace(/\(var3\)/g, variables[2]))

          infos = infos.filter((obj, pos, arr) => {

            return arr.map(mapObj =>
                  mapObj.name).indexOf(obj.name) == pos;

          });
          
          infos.sort(function (a, b) {
              return ptLabels.indexOf(a.name) - ptLabels.indexOf(b.name);
          });

          recipeInfo.setURL("https://genshin-impact.fandom.com/pt-br/wiki/" + fixedName);
          recipeInfo.fields = infos;

          if (edit) {message.edit({embed: recipeInfo, components: [buttons1]}).then(interaction.reply.defer());}
          else {message.channel.send("<@" + message.author.id + ">", {embed: recipeInfo, components: [buttons1]});}

        }

      } else {

        message.reply("essa receita não existe ou não está cadastrada.");
        console.log(`Deu erro, mané! (${name}) (${fixedName})`)

      }

    }).catch((e) => console.log(`Deu erro, mané! (${name}): ${e}\n\n----------------------\n`));

  } else {

    message.reply("essa receita não existe ou não está cadastrada.");

  }
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

module.exports = {listRecipes, recipe}