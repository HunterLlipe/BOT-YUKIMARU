"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const canvas = require("canvas");
const axios = require('axios');

function generator (message, cleanArgs) {

  let args = [];
  args[0] = cleanArgs.replace(/(.*?)_(.*)/, "$1");
  args[1] = cleanArgs.replace(/(.*?)_(.*)/, "$2");

  let result = "!banner-item " + args[0];
  let resultBoost = "!item-destaque " + args[0];
  let source = args[1].replace("https://genshin-impact.fandom.com/pt-br/wiki/", "");

  axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&prop=revisions&titles=${source}&rvprop=content&format=json`).then(res => {

    const fullData = Object.values(res.data.query.pages)[0].revisions;

    if (fullData) {
      
      fullData[0]["*"].split("Wish Pool")[1].split("}}")[0].split("|").slice(1).forEach((item, index, array) => {
  
        result += "_" + item.replace("\n", "").replace("^", "");
        if (item[0] == "^") resultBoost += "_" + item.replace("\n", "").replace("^", "");
        if (index == array.length - 1) {
          
          let finalResult = result.replace("\n", "") + "\n\n" + resultBoost.replace("\n", "");
          if (resultBoost == "!item-destaque " + args[0]) finalResult = result.replace("\n", "");
          message.channel.send(new discordjs.MessageAttachment(Buffer.from(finalResult, 'utf-8'), 'Resultado da Geração do Banner.txt'));
  
        }
  
      });

    } else {

      message.reply("link errado ou nome do banner não informado.")
      
    }

  });
  
}

async function preview (message, args, wixData) {

  let item = (await wixData.query("yukimaruItems").eq("name", args[0].toLowerCase()).find()).items[0];

  if (item) {

    let result = {label: `[${item.level}★] ${global.capitalize(item.name)}`, stars: item.level - 3, photoURL: item.photo};

    let complete = "";
    let complete2 = "";
    let i;

    for (i = 0; i < 5; i++) {

      if (result.stars == 2) result.label = "**" + result.label + "**";
      complete = complete + result.label + "\n"
      result.label = result.label.replace(/\*\*/g, "");

    }

    for (i = 5; i < 10; i++) {

      if (result.stars == 2) result.label = "**" + result.label + "**";
      complete2 = complete2 + result.label + "\n"
      result.label = result.label.replace(/\*\*/g, "");

    }
    
    const rollsImage = await canvas.createCanvas(1400, 600);
    const imageArea = await rollsImage.getContext('2d');
    let img = await canvas.loadImage('./resources/background.png');
    await imageArea.drawImage(img, 0, 0);

    for (i = 0; i < 10; i++) {

      let pos = 51; //230;

      img = await canvas.loadImage(result.photoURL);
  
      //if (img.naturalHeight > 800) pos = 101; 
      //imageArea.drawImage(img, img.naturalWidth / 8, 0, 900 / 4, 900, 75 + (125 * i), pos, 126, 447);

      if (img.naturalWidth == 320 && img.naturalHeight == 1024) { 
        
        await imageArea.drawImage(img, 42, 0, 239, 1024, 79 + (125 * i), pos, 118, 498);

      } else {

        await imageArea.drawImage(img, 79 + (125 * i), pos, 118, 498);

      }

      img = await canvas.loadImage('./resources/stars/star' + result.stars + '.png');
      await imageArea.drawImage(img, 102 + (125 * i), 490, 72, 14);

    }

    img = await canvas.loadImage('./resources/rollsOver.png');
    await imageArea.drawImage(img, 0, 0);
    
    const buffer = rollsImage.toBuffer('image/png');
    const file = new discordjs.MessageAttachment(buffer, 'resultImg.png')

    const rollres = new discordjs.MessageEmbed()
    .setColor('#e22618')
    .setTitle('Pré-visualização do Item')
    .addFields({ name: '\u200b', value: complete, inline: true }, { name: '\u200b', value: complete2, inline: true })
    .attachFiles([file])
    .setImage('attachment://resultImg.png');

    message.channel.send(rollres);
  
  } else {

    message.channel.send('Item inexistente ou não informado.');

  }
  
}

async function remove (message, args, wixData) {

  const banner = (await wixData.query("yukimaruBanners").eq("name", args[0].toLowerCase()).find()).items[0];

  if (banner) {
    
    const toreact = await message.reply('isso apagará todas as informações do banner **' + args[0] + '**. Tem certeza? Não pode ser recuperado e os membros não vão poder usar o banner.');
    toreact.react('👍').then(() => toreact.react('👎'));
    toreact.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
    { max: 1, time: 30000 }).then(collected => {
  
      if (collected.first().emoji.name == '👍') {
  
        
        wixData.remove("yukimaruBanners", banner._id).then(() => message.reply('o banner **' + args[0] + '** foi deletado.')).catch(() => message.reply('houve um erro ao deletar o banner.'));
  
      } else {
  
        message.reply('o banner **' + args[0] + '** NÃO foi deletado.');
  
      }
  
    }).catch(() => {
  
      message.reply('nenhuma decisão foi tomada depois de 30 segundos, dados NÃO deletados.');
  
    });

  } else {

    message.reply('banner não informado ou não existe.')
    
  }

}

async function add (message, args, wixData) {

  //args[0] = nome | args[1] = tipo

  let type;

  let name = args[0].toLowerCase();
  if (args[1]) type = args[1].toLowerCase();

  if (!(await wixData.query("yukimaruBanners").eq("name", name).find()).items[0] && ["weapon", "character", "standard"].includes(type)) {

    wixData.insert("yukimaruBanners", {"name": name, "type": type}).then(res => message.channel.send(`Banner **${global.capitalize(name)}** criado com sucesso!`)).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao criar banner. Erro: " + e))

  } else {

    message.channel.send("Outro banner já usa esse nome, informações incorretas ou não inseridas. Use `!ajuda` para mais informações.");

  }

}

async function edit (message, args, wixData) {

  let change;

  let name = args[0].toLowerCase();
  if (args[1]) change = args[1].toLowerCase();

  let item = (await wixData.query("yukimaruBanners").eq("name", name).find()).items[0]

  if (item && change) {
  
    if (["weapon", "character", "standard"].includes(change)) {

      message.channel.send(`Alterado de **${item.type}** para **${change}**.`);
      item.type = change;

    } else if (!(await wixData.query("yukimaruBanners").eq("name", change).find()).items[0]) {
        
      message.channel.send(`Alterado de **${global.capitalize(item.name)}** para **${global.capitalize(change)}**.`);
      item.name = change;

    } else {

      message.channel.send("Outro item já usa esse nome ou o novo nome é o mesmo que o anterior.");

    }

    wixData.update("yukimaruBanners", item);

  } else {

    message.channel.send("Não existe um item com esse nome ou você não especificou as mudanças a serem feitas.");

  }

}

async function bannerItem (message, args, wixData) {

  let banner = (await wixData.query("yukimaruBanners").eq("name", args[0].toLowerCase()).find()).items[0];

  if (banner) {

    const allItems = (await wixData.query("yukimaruItems").limit(1000).find()).items
    args = args.map(e => e.toLowerCase());
    let selectedItems = allItems.filter(item => args.slice(1).includes(item.name)).map(item => item._id);

    if (selectedItems[0]) {
      
      wixData.insertReference("yukimaruBanners", "generalItems", banner._id, selectedItems).then(res => message.channel.send(`${["Item adicionado.", "Itens adicionados."][+(!!(selectedItems.length - 1))]}`)).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao adicionar itens no banner. Erro: " + e));

    } else {

      message.channel.send(`Não existe ${["um item com esse nome", "itens com esses nomes"][+(!!(args.slice(1).length - 1))]} ou nenhum item citado.`);

    }

  } else {

    message.channel.send("Não existe um banner com esse nome ou você não informou o nome do banner.");

  }

}

async function bannerItemRemove (message, args, wixData) {

  let banner = (await wixData.query("yukimaruBanners").eq("name", args[0].toLowerCase()).find()).items[0];

  if (banner) {

    const allItems = (await wixData.query("yukimaruItems").limit(1000).find()).items
    args = args.map(e => e.toLowerCase());
    let selectedItems = allItems.filter(item => args.slice(1).includes(item.name)).map(item => item._id);

    if (selectedItems[0]) {

      wixData.removeReference("yukimaruBanners", "generalItems", banner._id, selectedItems).then(res => {
        
        wixData.removeReference("yukimaruBanners", "boostedItems", banner._id, selectedItems).then(res => message.channel.send(`${["Item removido.", "Itens removidos."][+(!!(selectedItems.length - 1))]}`)).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao remover itens no banner. Erro: " + e));
        
      }).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao remover itens no banner. Erro: " + e));

    } else {

      message.channel.send(`Não existe ${["um item com esse nome", "itens com esses nomes"][+(!!(args.slice(1).length - 1))]} ou nenhum item citado.`);

    }

  } else {

    message.channel.send("Não existe um banner com esse nome ou você não informou o nome do banner.");

  }

}

async function bannerItemBoost (message, args, wixData) {

  let banner = (await wixData.query("yukimaruBanners").eq("name", args[0].toLowerCase()).find()).items[0];

  if (banner) {

    const allItems = (await wixData.query("yukimaruItems").limit(1000).find()).items
    args = args.map(e => e.toLowerCase());
    let selectedItems = allItems.filter(item => args.slice(1).includes(item.name)).map(item => item._id);

    if (selectedItems[0]) {
      
      wixData.insertReference("yukimaruBanners", "generalItems", banner._id, selectedItems).then(res => {
        
        wixData.insertReference("yukimaruBanners", "boostedItems", banner._id, selectedItems).then(res => {
        
          message.channel.send(`${["Item destacado.", "Itens destacados."][+(!!(selectedItems.length - 1))]}`);
          
        }).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao destacar itens no banner. Erro: " + e));
        
      }).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao adicionar e destacar itens no banner. Erro: " + e));

    } else {

      message.channel.send(`Não existe ${["um item com esse nome", "itens com esses nomes"][+(!!(args.slice(1).length - 1))]} ou nenhum item citado.`);

    }

  } else {

    message.channel.send("Não existe um banner com esse nome ou você não informou o nome do banner.");

  }

}

async function bannerItemBoostRemove (message, args, wixData) {

  let banner = (await wixData.query("yukimaruBanners").eq("name", args[0].toLowerCase()).find()).items[0];

  if (banner) {

    const allItems = (await wixData.query("yukimaruItems").limit(1000).find()).items
    args = args.map(e => e.toLowerCase());
    let selectedItems = allItems.filter(item => args.slice(1).includes(item.name)).map(item => item._id);

    if (selectedItems[0]) {
      
      wixData.removeReference("yukimaruBanners", "boostedItems", banner._id, selectedItems).then(res => message.channel.send(`${["Item perdeu destaque. Ele ainda está no banner como um item sem destaque.", "Itens perderam os destaques. Eles ainda estão no banner como itens sem destaque."][+(!!(selectedItems.length - 1))]}`)).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao remover os destaques dos itens no banner. Erro: " + e));

    } else {

      message.channel.send(`Não existe ${["um item com esse nome", "itens com esses nomes"][+(!!(args.slice(1).length - 1))]} ou nenhum item citado.`);

    }

  } else {

    message.channel.send("Não existe um banner com esse nome ou você não informou o nome do banner.");

  }

}

module.exports = {add, edit, bannerItem, bannerItemRemove, bannerItemBoost, bannerItemBoostRemove, remove, preview, generator}