"use strict";

const global = require("./commands/_global")

async function add (message, args, wixData) {

  //args[0] = nome | args[1] = tipo | args[2] = estrela

  let type, level, photo;

  let name = args[0].toLowerCase();
  if (args[1]) type = args[1].toLowerCase();
  if (args[2]) level = Number(args[2]);

  if (isNaN(level)) level = 0
  if (message.attachments.size > 0) {
    photo = message.attachments.first().url;
  } else if (args[3]) {
    photo = message.content.split(args[2] + "_")[1];
  }

  if (!(await wixData.query("yukimaruItems").eq("name", name).find()).items[0] && level > 0 && level < 6 && ["weapon", "character"].includes(type) && photo) {

    wixData.insert("yukimaruItems", {"name": name, "level": level, "type": type, "photo": photo}).then(res => message.channel.send(`Item **${global.capitalize(name)}** criado com sucesso!`)).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao criar item. Erro: " + e))

  } else {

    message.channel.send("Outro item já usa esse nome, informações incorretas ou não inseridas. Use `!ajuda` para mais informações.");

  }

}

async function edit (message, args, wixData) {

  let change;

  let name = args[0].toLowerCase();
  if (args[1]) change = args[1].toLowerCase();

  let item = (await wixData.query("yukimaruItems").eq("name", name).find()).items[0]

  if (item && change) {
  
    if (["weapon", "character"].includes(change)) {

      message.channel.send(`Alterado de **${item.type}** para **${change}**.`);
      item.type = change;

    } else if (Number(change) > 0 && Number(change) < 6) {

      message.channel.send(`Alterado de **${item.level}** para **${change}**.`);
      item.level = Number(change);

    } else if (!(await wixData.query("yukimaruItems").eq("name", change).find()).items[0]) {

      message.channel.send(`Alterado de **${global.capitalize(item.name)}** para **${global.capitalize(change)}**.`);
      item.name = change;

    } else {

      message.channel.send("Outro item já usa esse nome ou o novo nome é o mesmo que o anterior.");

    }

    wixData.update("yukimaruItems", item);

  } else if (item && message.attachments.size > 0) {

    item.photo = message.attachments.first().url;
    message.channel.send("Foto alterada.");
    wixData.update("yukimaruItems", item);
  
  } else {

    message.channel.send("Não existe um item com esse nome ou você não especificou as mudanças a serem feitas.");

  }

}

module.exports = {add, edit}