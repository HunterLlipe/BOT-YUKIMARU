const logError = require('../core/logError');
const newData = require("../core/newData");
const cloudinary = global.cloudinary;

// necessário para pegar os dados
const nodemw = require('nodemw');

// necessário para pegar a imagem
const ddg = require('duck-duck-scrape');
const axios = require('axios');

function genshinItems (names) {
  const host = 'genshin-impact.fandom.com';
  const game = 'genshin';
  const qualityRegExp = /\|quality.*?= ?(.*)/;
  const typeRegExp = /character|weapon/;
  const weaponSubtypeRegExp = /\|type.*?= ?(.*)/;
  const searchQuery = ' honey impact';
  const searchURLStartIndex = 37;
  const urlVariables = {
    host: "https://genshin.honeyhunterworld.com/img/",
    itemType: {
      "weapon": "",
      "character": ""
    },
    imageType: {
      "weapon": "gacha_icon",
      "character": "gacha_card"
    }
  };

  return items(names, game, host, qualityRegExp, typeRegExp, weaponSubtypeRegExp, searchQuery, searchURLStartIndex, urlVariables);
}

function honkaiItems (names) {
  const host = 'honkai-star-rail.fandom.com';
  const game = 'honkai';
  const qualityRegExp = /\|rarity.*?= ?(.*)/;
  const typeRegExp = /character|light cone/;
  const weaponSubtypeRegExp = /\|effect_path.*?= ?(.*)/;
  const searchQuery = ' Honkai Star Rail Database - Honey Hunter';
  const searchURLStartIndex = 33;
  const urlVariables = {
    host: "https://hsr.honeyhunterworld.com/img/",
    itemType: {
      "weapon": "item/",
      "character": "character/"
    },
    imageType: {
      "weapon": "icon_figure",
      "character": "head_icon"
    }
  };

  return items(names, game, host, qualityRegExp, typeRegExp, weaponSubtypeRegExp, searchQuery, searchURLStartIndex, urlVariables);
}

async function items(names, game, host, qualityRegExp, typeRegExp, weaponSubtypeRegExp, searchQuery, searchURLStartIndex, urlVariables) {
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
    const article = await new Promise((resolve, reject) => {
      fandom.getArticle(name, (error, article) => {
        if (error) {
          reject(error);
        } else {
          resolve(article);
        }
      });
    });

    if (!article || article.toLowerCase().startsWith("#redirect")) {
      fails.push(name);
      continue;
    }
    
    // dados
    const englishName = decodeURIComponent(name).toLowerCase().replace(/\_/g, ' '); //article.match(/\|name.*?= ?(.*)|\|1_en.*?= ?(.*?)/)[1] ||
    const testPortugueseName = article.match(/pt-br:(.*)]]|\|pt.*?= ?(.*?)\n/) || [null, englishName];
    const portugueseName = testPortugueseName[1] || testPortugueseName[2];
    const itemQuality = Number(article.match(qualityRegExp)[1]);
    let itemType = article.toLowerCase().match(typeRegExp)[0];
    if (['light cone'].includes(itemType)) itemType = 'weapon';
    const itemSubtype = article.toLowerCase().match(itemType === 'character' ? /\|element.*?= ?(.*)/ : weaponSubtypeRegExp)[1];
  
    // imagem
    const searchResult = (await ddg.search(name + searchQuery)).results[0];
    const honeyID = searchResult?.url.slice(searchURLStartIndex, -9);
    const honeyImageURL = `${urlVariables.host}${urlVariables.itemType[itemType]}${honeyID}_${urlVariables.imageType[itemType]}.webp`; 
    let imageURL;

    try {
      // converter imagem para PNG
      const imageFileWEBP = await axios.get(honeyImageURL, {
        responseType: 'arraybuffer',
      });
      const imageFilePNG = await sharp(imageFileWEBP.data).toFormat('png').toBuffer();
      const imageUpload = await cloudinary.uploader.upload('data:image/png;base64,' + imageFilePNG.toString('base64'));
      imageURL = imageUpload.secure_url;
    } catch (error) {
      logError(error, 'gerar imagem para ' + name)
      fails.push(name);
      continue;
    }
    
    items.push(await newData.newItem(game, portugueseName, itemType, itemQuality, imageURL, itemSubtype, englishName));
  }
  
  return {items, fails};
}

function genshinBanner (link) {
  const game = 'genshin';
  const linkData = link.match(/^https:\/\/(genshin-impact\.fandom\.com.*?)\/wiki\/(.*)/); 
  const templateName = 'Wish Pool';

  return banner(game, linkData, templateName);
}

function honkaiBanner (link) {
  const game = 'honkai';
  const linkData = link.match(/^https:\/\/(honkai-star-rail\.fandom\.com.*?)\/wiki\/(.*)/); 
  const templateName = 'Warp Pool';

  return banner(game, linkData, templateName);
}

async function banner (game, linkData, templateName) {
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
  if (!article.includes(templateName)) throw "Link inválido ou impossibilidade de gerar banner através dele.";

  // itens
  let itemsAsArray = article.split(templateName)[1].split("}}")[0].replace(/<!--.*?-->\n/g, '').split("|").slice(1).map(item => item.replace("\n", ""));0
  if (!hostIsPortuguese) itemsAsArray = itemsAsArray.map(item => item.toLowerCase());
  const generalItems = itemsAsArray.map(item => item.replace(/^\^(.*?)/, '$1'));
  const boostedItems = itemsAsArray.filter(item => item.startsWith('^')).map(item => item.replace(/^\^(.*?)/, '$1'));

  // dados
  const nameInTheArticle = (article.match(/\|name.*?= ?(.*)/)[1])?.trim();
  const testPortugueseName = article.match(/pt-br:(.*)]]|\|pt.*?= ?(.*?)\n/);
  const portugueseName = hostIsPortuguese || !testPortugueseName ? nameInTheArticle : testPortugueseName[1] || testPortugueseName[2];
  const types = {
    "evento de personagem": "character",
    "character event": "character",
    "evento de arma": "weapon",
    "weapon event": "weapon",
    "light cone event": "weapon",
    "padrão": "standard",
    "standard": "standard"
  };
  const type = types[(article.toLowerCase().match(/\|type.*?= ?(.*)/)[1])?.trim()];

  return await newData.newBanner(game, portugueseName, type, type != 'standard' ? boostedItems[0].split(' ')[0] : 'mochileiro', generalItems, boostedItems, hostIsPortuguese ? 'name' : 'englishName');
}

// (async () => console.log(await honkaiBanner('https://honkai-star-rail.fandom.com/wiki/Stellar_Warp')))();

module.exports = { genshinItems, honkaiItems, genshinBanner, honkaiBanner };