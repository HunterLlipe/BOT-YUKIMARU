const logError = require('../core/logError');
const newData = require("../core/newData");
const cloudinary = global.cloudinary;

// necessário para pegar os dados
const nodemw = require('nodemw');

// necessário para pegar a imagem
const googleSr = require('google-sr');
const axios = require('axios');
const e = require('express');

// (() => ddg.search('teste').then(e => console.log(e)))()

function genshinItems (names, method) {
  const host = 'genshin-impact.fandom.com';
  const game = 'genshin';
  const qualityRegExp = /\|quality.*?= ?(.*)/;
  const typeRegExp = /character|weapon/;
  const weaponSubtypeRegExp = /\|type.*?= ?(.*)/;
  const characterSubtypeRegExp = /\|element.*?= ?(.*)/;

  return items(names, game, host, qualityRegExp, typeRegExp, weaponSubtypeRegExp, characterSubtypeRegExp, null, genshinImage, method);
}

function honkaiItems (names, method) {
  const host = 'honkai-star-rail.fandom.com';
  const game = 'honkai';
  const qualityRegExp = /\|rarity.*?= ?(.*)/;
  const typeRegExp = /character|light cone/;
  const weaponSubtypeRegExp = /\|effect_path.*?= ?(.*)/;
  const characterSubtypeRegExp = /\|combattype.*?= ?(.*)/;
  const secondSubtypeRegExp = /\|path.*?= ?(.*)/;

  return items(names, game, host, qualityRegExp, typeRegExp, weaponSubtypeRegExp, characterSubtypeRegExp, secondSubtypeRegExp, honkaiImage, method);
}

function zzzItems (names, method) {
  const host = 'zenless-zone-zero.fandom.com';
  const game = 'zzz';
  const qualityRegExp = /\|rank.*?= ?(.*)/;
  const typeRegExp = /agent|w-engine/;
  const weaponSubtypeRegExp = /\|specialty.*?= ?(.*)/;
  const characterSubtypeRegExp = /\|specialty.*?= ?(.*)/;
  const secondSubtypeRegExp = /\|attribute.*?= ?(.*)/;

  return items(names, game, host, qualityRegExp, typeRegExp, weaponSubtypeRegExp, characterSubtypeRegExp, secondSubtypeRegExp, zzzImage, method);
}

async function genshinImage(name, itemType) {
  const urlVariables = {
    itemType: {
      "weapon": "",
      "character": ""
    },
    imageType: {
      "weapon": "gacha_icon",
      "character": "gacha_card"
    }
  };

  const searchResult = (await googleSr.search({query: name + ' honey impact'}))[0];
  const searchResultItem = searchResult.find(e => e.title.toLowerCase().includes(name.toLowerCase())) || searchResult[0];
  const honeyID = searchResultItem?.link.split('/')[3];
  const honeyImageURL = `https://gensh.honeyhunterworld.com/img/${urlVariables.itemType[itemType]}${honeyID}_${urlVariables.imageType[itemType]}.webp`;
  
  return honeyImageURL;
}

async function honkaiImage(name, itemType) {
  const urlVariables = {
    itemType: {
      "weapon": "item/",
      "character": "character/"
    },
    imageType: {
      "weapon": "icon_thumbnail_large",
      "character": "head_icon"
    }
  };

  const searchResult = await googleSr.search({query: name + ' Honkai Star Rail Database - Honey Hunter'});
  const searchResultItem = searchResult.find(e => e.title.toLowerCase().includes(name.toLowerCase())) || searchResult[0];
  const honeyID = searchResultItem?.link.split('/')[3];
  const honeyImageURL = `https://starrail.honeyhunterworld.com/img/${urlVariables.itemType[itemType]}${honeyID}_${urlVariables.imageType[itemType]}.webp`;

  return honeyImageURL;
}

async function zzzImage(name, itemType) {
  try {
    const urlVariables = {
      imageType: {
        "character": "Agent_",
        "weapon": "W-Engine_"
      }
    };

    const searchResult = (await googleSr.search({query: name + ' Zenless Zone Zero Fandom'}))[0];
    const wikiaID = searchResult?.link.split('/')[4];
    
    // pegar no JSON da wikia o URL para o arquivo
    const getFileURL = `https://zenless-zone-zero.fandom.com/wikia.php?controller=CuratedContent&method=getImage&title=File:${urlVariables.imageType[itemType]}${wikiaID}${itemType === 'character' ? '_Portrait' : ''}.png`;
    const {data: fileURLJson} = await axios.get(getFileURL);
    const wikiImageURL = fileURLJson.url?.match(/(.*)latest/)[0];
    
    return wikiImageURL || "https://starrail.honeyhunterworld.com/img/error.webp";
  } catch (e) {
    logError(e, 'falha ao gerar imagem para ' + name);
    throw e;
  }
}

async function items(names, game, host, qualityRegExp, typeRegExp, weaponSubtypeRegExp, characterSubtypeRegExp, secondSubtypeRegExp, imageFunction, method) {
  const fixSubtypes = ['destruction', 'erudition', 'harmony', 'nihility', 'preservation', 'abundance'];
  const sharp = require('sharp');

  const fandom = new nodemw({
    protocol: 'https',
    server: host,
    path: '/api.php', // path to api.php script
    debug: false
  });

  let items = [];
  let fails = [];

  for (const name of names) {
    const searchArticle = await googleSr.search({query: `${name} ${({'zzz': 'Zenless Zone Zero', 'honkai': 'Honkai Star Rail', 'genshin': 'Genshin Impact'})[game]} fandom`});
    const searchArticleResult = decodeURIComponent(searchArticle?.find(e => e.link.includes(host + "/wiki/"))?.link.split('/')[4].replace(/_/g, ' '));
    
    let article = await new Promise((resolve, reject) => {
      fandom.getArticle((searchArticleResult || name), async (error, article) => {
        if (error) {
          console.error('wiki error:', error)
          reject(error);
        } else {
          resolve(article);
        }
      });
    });
    
    if (!article) {
      logError(article, 'artigo inexistente para ' + name)
      fails.push(name);
      continue;
    } else if (article.toLowerCase().startsWith("#redirect")) {
      article = await new Promise((resolve, reject) => {
        fandom.getArticle(article.match(/#REDIRECT \[\[(.*)\]\]/)[1], (error, article) => {
          if (error) {
            reject(error);
          } else {
            resolve(article);
          }
        });
      });

      // se tiver outro redirect, aí...
      if (article.toLowerCase().startsWith("#redirect")) {
        logError(article, 'excesso de redirect em ' + name)
        fails.push(name);
        continue;
      }
    }
    
    // dados
    const englishName = decodeURIComponent(name).toLowerCase().replace(/\_/g, ' '); //article.match(/\|name.*?= ?(.*)|\|1_en.*?= ?(.*?)/)[1] ||
    const testPortugueseName = article.match(/pt-br:(.*)]]|\|pt.*?= ?(.*?)\n/) || [null, decodeURIComponent(name).replace(/\_/g, ' ')];
    const portugueseName = testPortugueseName[1] || testPortugueseName[2] || decodeURIComponent(name).replace(/\_/g, ' ');
    const itemQuality = Number(article.match(qualityRegExp)[1].replace(/S/g, '5').replace(/A/g, '4').replace(/B/g, '3'));
    let itemType = article.toLowerCase().match(typeRegExp)[0];
    if (['agent'].includes(itemType)) itemType = 'character';
    if (['light cone', 'w-engine'].includes(itemType)) itemType = 'weapon';
    const itemSubtype = article.toLowerCase().match(itemType === 'character' ? characterSubtypeRegExp : weaponSubtypeRegExp)[1]?.trim();
    const testItemSubtype2 = article.toLowerCase().match(secondSubtypeRegExp) || [null, null];
    const itemSubtype2 = testItemSubtype2[1]?.trim();
    let imageURL;
    
    try {
      imageURL = await imageFunction(name, itemType);

      // converter imagem para PNG
      const imageFileWEBP = await axios.get(imageURL, {
        responseType: 'arraybuffer',
      });
      const imageFilePNG = await sharp(imageFileWEBP.data).toFormat('png').toBuffer();
      const imageUpload = await cloudinary.uploader.upload('data:image/png;base64,' + imageFilePNG.toString('base64'));
      imageURL = imageUpload.secure_url;
    } catch (error) {
      logError(error, 'gerar imagem para ' + name)
      imageURL = 'https://res.cloudinary.com/duwng4tki/image/upload/v1736277599/chba1o6wjkxqtaxozfmx.png';
      continue;
    }

    items.push(await newData.newItem(game, portugueseName, englishName, itemType, itemQuality, imageURL, fixSubtypes.includes(itemSubtype) ? 'the ' + itemSubtype : itemSubtype, fixSubtypes.includes(itemSubtype2) ? 'the ' + itemSubtype2 : itemSubtype2, undefined, method));
  }
  
  return {items, fails};
}

function genshinBanner (link) {
  const game = 'genshin';
  const linkData = link.match(/^https:\/\/(genshin-impact\.fandom\.com.*?)\/wiki\/(.*)/); 
  const templateName = 'Wish Pool';

  return banner(game, linkData, templateName, "weapon");
}

function honkaiBanner (link) {
  const game = 'honkai';
  const linkData = link.match(/^https:\/\/(honkai-star-rail\.fandom\.com.*?)\/wiki\/(.*)/); 
  const templateName = 'Warp Pool';

  return banner(game, linkData, templateName, "lightcone");
}

function zzzBanner (link) {
  const game = 'zzz';
  const linkData = link.match(/^https:\/\/(zenless-zone-zero\.fandom\.com.*?)\/wiki\/(.*)/);
  const templateName = 'Signal Search Pool';

  return banner(game, linkData, templateName, "w-engine", "agent");
}

async function banner (game, linkData, templateName, weaponLabel, characterLabel = "character") {
  const host = linkData[1];
  const bannerName = decodeURIComponent(linkData[2]);
  const hostIsPortuguese = host.includes('pt-br');

  const fandom = new nodemw({
    protocol: 'https',
    server: host,
    path: '/api.php', // path to api.php script
    debug: false
  });

  const article = await new Promise((resolve, reject) => {
    fandom.getArticle(bannerName, (error, article) => {
      if (error) {
        reject(error);
      } else {
        resolve(article);
      }
    });
  });
  if (!article?.includes(templateName)) throw "Link inválido ou impossibilidade de gerar banner através dele.";

  // itens
  let generalItems, boostedItems;
  if (['genshin', 'honkai', 'zzz'].includes(game) && !hostIsPortuguese) {
    const itemsAsText = article.split(templateName)[1].split("}}")[0].replace(/<!--.*?-->\n/g, '').replace(/_S/g, '_5').replace(/_A/g, '_4').replace(/_B/g, '_3');
    const lines = itemsAsText.split('\n').filter(line => line.trim() !== '');
    let itemsAsObject = {};

    lines.forEach(line => {
        const parts = line.split('=');
        const key = parts[0].trim().replace('|', '');
        const value = parts[1].trim().split(';').map(item => item.trim());
        itemsAsObject[key] = value.map(e => e);
    });

    generalItems = [...itemsAsObject[characterLabel + "_5"] || [], ...itemsAsObject[characterLabel + "_4"] || [], ...itemsAsObject[weaponLabel + "_5"] || [], ...itemsAsObject[weaponLabel + "_4"] || [], ...itemsAsObject[weaponLabel + "_3"] || []];
    boostedItems = [...itemsAsObject[characterLabel + "_5_F"] || [], ...itemsAsObject[characterLabel + "_4_F"] || [], ...itemsAsObject[weaponLabel + "_5_F"] || [], ...itemsAsObject[weaponLabel + "_4_F"] || []];
  } else {
    let itemsAsArray = article.split(templateName)[1].split("}}")[0].replace(/<!--.*?-->\n/g, '').split("|").slice(1).map(item => item.replace("\n", ""));
    if (!hostIsPortuguese) itemsAsArray = itemsAsArray.map(item => item.toLowerCase());
    generalItems = itemsAsArray.map(item => item.replace(/^\^(.*?)/, '$1'));
    boostedItems = itemsAsArray.filter(item => item.startsWith('^')).map(item => item.replace(/^\^(.*?)/, '$1'));
  }
  
  // dados
  const nameInTheArticle = (article.match(/\|name.*?= ?(.*)/)[1])?.trim();
  const testPortugueseName = article.match(/pt-br:(.*)]]|\|pt.*?= ?(.*?)\n/);
  const portugueseName = hostIsPortuguese || !testPortugueseName ? nameInTheArticle : testPortugueseName[1] || testPortugueseName[2];
  const types = {
    "evento de personagem": "character",
    "character event": "character",
    "exclusive channel": "character",
    "evento de arma": "weapon",
    "weapon event": "weapon",
    "light cone event": "weapon",
    "w-engine channel": "weapon",
    "padrão": "standard",
    "standard": "standard",
    "stable": "standard",
    "chronicled": "chronicled",
    "registro de oração": "chronicled"
  };
  const type = types[(article.toLowerCase().match(/\|type.*?= ?(.*)/)[1])?.trim()];
  const commandNicks = {
    character: boostedItems[0],
    weapon: 'armas',
    standard: 'mochileiro',
    chronicled: 'registro'
  }

  return await newData.newBanner(game, portugueseName, type, commandNicks[type], generalItems, boostedItems, hostIsPortuguese ? 'name' : 'englishName');
}

// (async () => console.log(await zzzImage('Rainforest Gourmet', 'weapon')))();

module.exports = { genshinItems, honkaiItems, zzzItems, genshinBanner, honkaiBanner, zzzBanner, genshinImage, honkaiImage, zzzImage };