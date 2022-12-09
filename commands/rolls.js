"use strict";

const global = require("./commands/_global");
const discordjs = require("discord.js");
const canvas = require("canvas");

async function clean (message, wixData) {
try {
  const toreact = await message.reply('isso apagará seus dados de desejos e inventários, deseja continuar?');
  toreact.react('👍').then(() => toreact.react('👎'));
  toreact.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'),
  { max: 1, time: 30000 }).then(collected => {

    if (collected.first().emoji.name == '👍') {

      wixData.remove("yukimaruInventory", message.author.id).then(() => message.reply('seus dados foram deletados.')).catch(() => message.reply('houve um erro ao deletar seus dados.'));

    } else {

      message.reply('seus dados NÃO foram deletados.');

    }

  }).catch((e) => {

    //console.log(e)

    message.reply('nenhuma decisão foi tomada depois de 30 segundos, dados NÃO deletados.');

  });
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

async function roll (message, args, wixData) {
try {
  const loadingMessage = await message.reply("analisando...");

  const banner = (await wixData.query("yukimaruBanners").eq("name", args[0].toLowerCase()).find()).items[0];
  let itemsByStars = [];
  let itemsBoostedByStars = [[]];
  let rolls;

  let i;

  if (banner) {

    rolls = (await wixData.query("yukimaruInventory").eq("_id", message.author.id).find()).items[0];
    if (!rolls) rolls = { "_id": message.author.id, "id": message.author.id, "characterRolls": 0, "weaponRolls": 0, "noneRolls": 0, "characterLast5": 0, "noneLast5": 0, "weaponLast5": 0, "noneStar5BoostedInv":[],"noneStar5Inv":[],"weaponStar5BoostedInv":[],"weaponStar5Inv":[],"characterStar5BoostedInv":[],"characterStar5Inv":[],"weaponStar4BoostedInv":[],"characterStar4BoostedInv":[],"noneStar4BoostedInv":[],"characterStar4Inv":[],"weaponStar4Inv":[],"noneStar4Inv":[] };

    const generalItemsData = (await wixData.queryReferenced("yukimaruBanners", banner._id, "generalItems"));
    let generalItems = generalItemsData._items;
    if (generalItemsData._totalCount > 50) generalItems = [...generalItems, ...((await wixData.queryReferenced("yukimaruBanners", banner._id, "generalItems", {"skip": 50}))._items)];

    const boostedItems = (await wixData.queryReferenced("yukimaruBanners", banner._id, "boostedItems"))._items;
    
    itemsByStars.push(generalItems.filter(item => item.level == 3));
    itemsByStars.push(generalItems.filter(item => item.level == 4));
    itemsByStars.push(generalItems.filter(item => item.level == 5));

    itemsBoostedByStars.push(boostedItems.filter(item => item.level == 4));
    itemsBoostedByStars.push(boostedItems.filter(item => item.level == 5));

  }

  if (!banner) {

    loadingMessage.delete();
    message.reply('você não especificou nenhum banner/oração ou banner/oração inexistente. Envie `!oração-list` ou `!banner-list` para ver a lista de banners/orações.');

  } else if (!itemsByStars.some(e => e.length == 0) && itemsBoostedByStars[1].length != itemsByStars[1].length && itemsBoostedByStars[2].length != itemsByStars[2].length) {

    loadingMessage.delete();
    message.reply("https://media3.giphy.com/media/LQ9IaEvO55PrR2bgIA/giphy.gif").then(async (sentMessage) => {

      let bannerType = banner.type;
      if (bannerType == "" || bannerType == "standard") bannerType = "none";

      function createResult(listItems, inventory, stars) {

        let choosed = Math.floor(Math.random() * listItems.length);
        //console.log({label: `[${stars + 3}★]${capitalize(star[stars][listItems[choosed]].name)}`, stars: stars, photoURL: star[stars][listItems[choosed]].photo})

        // add item no inventory by star | typeStarXInv
        if (stars > 0) rolls[bannerType + "Star" + (stars + 3) + inventory].push(listItems[choosed]._id);
        return { label: `[${stars + 3}★] ${global.capitalize(listItems[choosed].name)}`, stars: stars, photoURL: listItems[choosed].photo, type: {"weapon": 0, "character": 1}[listItems[choosed].type] };

      }

      function generateItem(star, limitBoosted, bannerType) {

        //1console.log(rolls[bannerType + "Star" + star + "BoostedInv"], rolls[bannerType + "Star" + star + "Inv"])

        if (rolls[bannerType + "Star" + star + "BoostedInv"].length > 0 && rolls[bannerType + "Star" + star + "Inv"].length > 0) { 
  
            rolls[bannerType + "Star" + star + "BoostedInv"].length = 0; 
            rolls[bannerType + "Star" + star + "Inv"].length = 0;
            
        }

        if (itemsBoostedByStars[star - 3].length == 0) { //Evitando problemas no caso de não ter nenhum boost naquele banner

          // console.log("não tem boost no banner");
          return createResult(itemsByStars[star - 3], "Inv", star - 3, bannerType);

        } else { // o sistema de verdade

          let difference = itemsByStars[star - 3].filter(x => !itemsBoostedByStars[star - 3].includes(x)); // lista de itens sem boost

          if (rolls[bannerType + "Star" + star + "BoostedInv"].length == 0 && rolls[bannerType + "Star" + star + "Inv"].length == 0) { // usuario nao tem nada, então vamos sortear

            let chanceBoosted = Math.random();

            if (chanceBoosted <= limitBoosted) { // Tirou item com boost

              //console.log(chanceBoosted, limitBoosted, "boost - limpa inventario");

              let result = createResult(itemsBoostedByStars[star - 3], "BoostedInv", star - 3, bannerType);
              //console.log(banners[bannersList.indexOf(args.toLowerCase())]["bosstar" + star], "BoostedInv", star - 3, bannerType)
              rolls[bannerType + "Star" + star + "BoostedInv"].length = 0;
              return result;

            } else { // Não tirou item com boost

              //console.log(chanceBoosted, limitBoosted, "não boost - nao limpa inventario", difference);

              //console.log(difference, "inv", star - 3, bannerType)
              return createResult(difference, "Inv", star - 3, bannerType);

            }

          } else if (rolls[bannerType + "Star" + star + "BoostedInv"].length == 0 && rolls[bannerType + "Star" + star + "Inv"].length > 0) { // não tem um boosted, então tome boost

            //console.log("não tem boost, ent tome boost");

            //console.log(banners[bannersList.indexOf(args.toLowerCase())]["bosstar" + star], "BoostedInv", star - 3, bannerType)
            return createResult(itemsBoostedByStars[star - 3], "BoostedInv", star - 3, bannerType);

          }

        }

      }

      rolls[bannerType + "Rolls"] += 10;

      let result = [];
      let itemRandom = Math.random(); //Sorteando o primeiro

      if (bannerType == "character") {

        //O primeiro será um 4 ou 5 estrelas
        //0.006 é a chance de ser um 5, se não é 4
        //console.log(itemRandom);

        if (itemRandom <= 0.006) { //5 estrelas

          sentMessage.edit("https://media3.giphy.com/media/orSLaW9ZelYrsi1aWy/giphy.gif?cid=790b76115d3c7dd780527cdb9a91e3507a09ef97c59039f4&rid=giphy.gif&ct=g");
          result.push(generateItem(5, 0.5, bannerType));
          rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

        } else { //4 estrelas

          //console.log(4);

          result.push(generateItem(4, 0.5, bannerType));

        }

        if (rolls[bannerType + "Rolls"] - rolls[bannerType + "Last5"] == 90) {

          //console.log("deu 90");

          sentMessage.edit("https://media3.giphy.com/media/orSLaW9ZelYrsi1aWy/giphy.gif?cid=790b76115d3c7dd780527cdb9a91e3507a09ef97c59039f4&rid=giphy.gif&ct=g");
          result.push(generateItem(5, 0.5, bannerType));
          rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

        }

        //console.log(result)

        let limit = 10 - result.length;

        for (i = 0; i < limit; i++) {

          itemRandom = Math.random();
          if (itemRandom <= 0.006) {

            //console.log (i, itemRandom, 5);

            result.push(generateItem(5, 0.5, bannerType));
            rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

          } else if (itemRandom <= 0.057) {

            //console.log (i, itemRandom, 4);

            result.push(generateItem(4, 0.5, bannerType));

          } else {

            //console.log (i, itemRandom, 3);

            result.push(createResult(itemsByStars[0], "", 0, bannerType));

          }

        }

      } else if (bannerType == "weapon") {

        //O primeiro será um 4 ou 5 estrelas
        //0.007 é a chance de ser um 5, se não é 4

        if (itemRandom <= 0.007) { //5 estrelas

          //console.log(itemRandom, 5)

          sentMessage.edit("https://media3.giphy.com/media/orSLaW9ZelYrsi1aWy/giphy.gif?cid=790b76115d3c7dd780527cdb9a91e3507a09ef97c59039f4&rid=giphy.gif&ct=g");
          result.push(generateItem(5, 0.75, bannerType));
          rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

        } else { //4 estrelas

          //console.log(itemRandom, 4)

          //console.log(bannerType)

          result.push(generateItem(4, 0.75, bannerType));

        }

        if (rolls[bannerType + "Rolls"] - rolls[bannerType + "Last5"] == 80) {

          //console.log(80);

          sentMessage.edit("https://media3.giphy.com/media/orSLaW9ZelYrsi1aWy/giphy.gif?cid=790b76115d3c7dd780527cdb9a91e3507a09ef97c59039f4&rid=giphy.gif&ct=g");
          result.push(generateItem(5, 0.75, bannerType));
          rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

        }

        //console.log(result)

        let limit = 10 - result.length;

        for (i = 0; i < limit; i++) {

          itemRandom = Math.random();
          if (itemRandom <= 0.007) {

            //console.log (i, itemRandom, 5);

            result.push(generateItem(5, 0.75, bannerType));
            rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

          } else if (itemRandom <= 0.067) {

            //console.log (i, itemRandom, 4);

            result.push(generateItem(4, 0.75, bannerType));

          } else {

            //console.log (i, itemRandom, 3);

            result.push(createResult(itemsByStars[0], "", 0, bannerType));

          }

        }

      } else { // Mochileiro

        //O primeiro será um 4 ou 5 estrelas
        //0.006 é a chance de ser um 5, se não é 4

        if (itemRandom <= 0.006) { //5 estrelas
          //console.log(itemRandom, 5)

          sentMessage.edit("https://media3.giphy.com/media/orSLaW9ZelYrsi1aWy/giphy.gif?cid=790b76115d3c7dd780527cdb9a91e3507a09ef97c59039f4&rid=giphy.gif&ct=g");
          result.push(generateItem(5, 0.5, bannerType));
          rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

        } else { //4 estrelas
          //console.log(itemRandom, 4)

          result.push(generateItem(4, 0.5, bannerType));

        }

        if (rolls[bannerType + "Rolls"] - rolls[bannerType + "Last5"] == 90) {

          //console.log(90);

          sentMessage.edit("https://media3.giphy.com/media/orSLaW9ZelYrsi1aWy/giphy.gif?cid=790b76115d3c7dd780527cdb9a91e3507a09ef97c59039f4&rid=giphy.gif&ct=g");
          result.push(generateItem(5, 0.5, bannerType));
          rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

        }

        //console.log(result)

        let limit = 10 - result.length;

        for (i = 0; i < limit; i++) {

          itemRandom = Math.random();
          if (itemRandom <= 0.006) {

            //console.log (i, itemRandom, 5);

            result.push(generateItem(5, 0.5, bannerType));
            rolls[bannerType + "Last5"] = rolls[bannerType + "Rolls"];

          } else if (itemRandom <= 0.057) {

            //console.log (i, itemRandom, 4);

            result.push(generateItem(4, 0.5, bannerType));

          } else {

            //console.log (i, itemRandom, 3);

            result.push(createResult(itemsByStars[0], "", 0, bannerType));

          }

        }

      }

      await wixData.save("yukimaruInventory", rolls);

      // Gerar mensagem
      result.sort((a, b) => b.type - a.type);
      result.sort((a, b) => b.stars - a.stars);

      let complete = "";
      let complete2 = "";

      for (i = 0; i < Math.ceil(result.length / 2); i++) {

        if (result[i].stars == 2) result[i].label = "**" + result[i].label + "**";
        complete = complete + result[i].label + "\n"

      }

      for (i = Math.ceil(result.length / 2); i < result.length; i++) {

        if (result[i].stars == 2) result[i].label = "**" + result[i].label + "**";
        complete2 = complete2 + result[i].label + "\n"

      }

      const rollsImage = await canvas.createCanvas(1400, 600);
      const imageArea = await rollsImage.getContext('2d');

      sendFinal();

      async function sendFinal() {

        let img = await canvas.loadImage('./resources/background.png');
        await imageArea.drawImage(img, 0, 0);

        for (i = 0; i < result.length; i++) {

          let pos = 51; //230;

          img = await canvas.loadImage(result[i].photoURL);
      
          //if (img.naturalHeight > 800) pos = 101; 
          //imageArea.drawImage(img, img.naturalWidth / 8, 0, 900 / 4, 900, 75 + (125 * i), pos, 126, 447);

          if (img.naturalWidth == 320 && img.naturalHeight == 1024) { 
            
            await imageArea.drawImage(img, 42, 0, 239, 1024, 79 + (125 * i), pos, 118, 498);

          } else {

            await imageArea.drawImage(img, 79 + (125 * i), pos, 118, 498);

          }

          img = await canvas.loadImage('./resources/stars/star' + result[i].stars + '.png');
          await imageArea.drawImage(img, 102 + (125 * i), 490, 72, 14);

        }

        img = await canvas.loadImage('./resources/rollsOver.png');
        await imageArea.drawImage(img, 0, 0);
        
        const buffer = rollsImage.toBuffer('image/png');
        const file = new discordjs.MessageAttachment(buffer, 'resultImg.png')

        const rollres = new discordjs.MessageEmbed()
        .setColor('#e22618')
        .setTitle('Resultado da Oração de ' + message.author.username)
        .setThumbnail(message.author.avatarURL())
        .addFields({ name: global.capitalize(banner.name), value: complete, inline: true }, { name: '\u200b', value: complete2, inline: true })
        .attachFiles([file])
        .setImage('attachment://resultImg.png')
        .setFooter(`Esse foi seu ${rolls[bannerType + "Rolls"]}º desejo. Faltam ${({"character": 90, "none": 90, "weapon": 80}[bannerType] + rolls[bannerType + "Last5"]) - rolls[bannerType + "Rolls"]} desejos para um 5 estrelas garantido.`);

        sentMessage.delete();
        message.reply(rollres);

      }

    })

  } else {

    message.reply('houve um erro ao gerar a oração.');

  }
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`);
  message.reply('**Eita!** Este comando contém um bug e você o atingiu! ||<@555429270919446549>||');
}
}

module.exports = {roll, clean}
