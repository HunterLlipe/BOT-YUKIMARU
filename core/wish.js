const { createCanvas, loadImage } = require('canvas');

// Realizar uma oração
function wishOneItem (banner, streakWithout, lastStarWasBoosted) {
  const bannersRules = {
    'character': {
      5: {
        rate: 0.6,
        guaranteeWishIndex: 90,
        boostedGuaranteeRate: 50
      },
      4: {
        rate: 5.1,
        guaranteeWishIndex: 10,
        boostedGuaranteeRate: 50
      }
    },
    'weapon': {
      5: {
        rate: 0.7,
        guaranteeWishIndex: 80,
        boostedGuaranteeRate: 75
      },
      4: {
        rate: 6,
        guaranteeWishIndex: 10,
        boostedGuaranteeRate: 75
      }
    },
    'standard': {
      5: {
        rate: 0.6,
        guaranteeWishIndex: 90,
        boostedGuaranteeRate: -1
      },
      4: {
        rate: 5.1,
        guaranteeWishIndex: 10,
        boostedGuaranteeRate: -1
      }
    }
  }
  
  let bannerRules = bannersRules[banner.type];
  const streakWithoutBannerType = streakWithout[banner.type];
  
  if ((streakWithoutBannerType[4] + 1) % bannerRules[4].guaranteeWishIndex === 0) bannerRules[4].rate = 100 - bannerRules[5].rate;
  if ((streakWithoutBannerType[5] + 1) % bannerRules[5].guaranteeWishIndex === 0) bannerRules[5].rate = 100;

  return applyRulesAndGetItem(streakWithout, lastStarWasBoosted, banner.type, bannerRules[5], bannerRules[4], banner.generalItems, banner.boostedItems);
}

function applyRulesAndGetItem(streakWithout, lastStarWasBoosted, bannerType, fiveStarRules, fourStarRules, generalItems, boostedItems) {
  const rate = Math.random() * 100;

  if (rate <= fiveStarRules.rate) {
    streakWithout[bannerType][4] = 0;
    streakWithout[bannerType][5] = 0;

    const isBoosted = checkIfIsBoosted(5, fiveStarRules, lastStarWasBoosted, bannerType);
    const item = chooseRandomItem(isBoosted ? boostedItems : generalItems, 5);
    return {item, streakWithout, lastStarWasBoosted};
  } else if (rate <= fourStarRules.rate + fiveStarRules.rate) {
    streakWithout[bannerType][4] = 0;
    streakWithout[bannerType][5] += 1;

    const isBoosted = checkIfIsBoosted(4, fourStarRules, lastStarWasBoosted, bannerType);
    const item = chooseRandomItem(isBoosted ? boostedItems : generalItems, 4);
    return {item, streakWithout, lastStarWasBoosted};
  } else {
    streakWithout[bannerType][4] += 1;
    streakWithout[bannerType][5] += 1;
    
    const item = chooseRandomItem(generalItems, 3);
    return {item, streakWithout, lastStarWasBoosted};
  }
}

function checkIfIsBoosted (quality, rules, lastStarWasBoosted, bannerType) {
  if (rules.boostedGuaranteeRate === -1) return false;

  const boostedRate = Math.random() * 100;
  let isBoosted = boostedRate <= rules.boostedGuaranteeRate;
  if (!lastStarWasBoosted[bannerType][quality]) isBoosted = true;
  lastStarWasBoosted[bannerType][quality] = isBoosted;
  return isBoosted;
}

function chooseRandomItem (items, quality) {
  const possibleItems = items.filter(item => item.quality === quality);
  const chosen = Math.floor(Math.random() * possibleItems.length);
  const chosenItem = possibleItems[chosen];
  return chosenItem;
}

function wishTenItemsAndSort(banner, streakWithout, lastStarWasBoosted) {
  const items = [];

  for (let i = 1; i <= 10; i++) {
    const item = wishOneItem(banner, streakWithout, lastStarWasBoosted);
    streakWithout = item.streakWithout;
    lastStarWasBoosted = item.lastStarWasBoosted;
    items.push(item.item);
  }
  
  const sortedItems = items
    .sort((a, b) => {
      if (a.type === b.type) {
        return 0; // Preserve the original order when the types are the same
      } else if (a.type === 'character') {
        return -1; // Place characters before weapons
      } else {
        return 1; // Place weapons after characters
      }
    })
    .sort((a, b) => b.quality - a.quality);
  
  // 5-star character > 5-star weapon > 4-star character > 4-star weapon > 3-star
  return {wish: sortedItems, streakWithout, lastStarWasBoosted}
}

async function genshinWishImage(items) {
  const resourcesFolder = './resources/genshin';

  // Dimensões
  const imageXPosition = (i) => {return 79 + (125 * i)};
  const imageYPosition = 51;
  const imageWidth = 120;
  const imageHeight = 500;

  const starXPosition = (i) => {return 102 + (125 * i)};
  const starYPosition = 490;
  const starWidth = 72;
  const starHeight = 14;

  const subtypeXPosition = (i) => {return 104 + (125 * i)};
  const subtypeYPosition = 412;
  const subtypeWidth = 70;
  const subtypeHeight = 70;

  // Criar canvas principal e botar background
  const background = await loadImage(`${resourcesFolder}/background.png`);
  const mainCanvas = createCanvas(background.width, background.height);
  const mainContext = mainCanvas.getContext('2d');
  mainContext.drawImage(background, 0, 0);

  // Carregar as imagens do resultado do roll e colocá-las lado a lado
  for (i = 0; i < 10; i++) {
    const currentItem = items[i];
    
    const itemImage = await loadImage(getGenshinFixedURL(currentItem));
    mainContext.drawImage(itemImage, imageXPosition(i), imageYPosition, imageWidth, imageHeight);

    const starImage = await loadImage(`${resourcesFolder}/stars/star` + currentItem.quality + '.png');
    mainContext.drawImage(starImage, starXPosition(i), starYPosition, starWidth, starHeight);

    const subtypesImage = await loadImage(`${resourcesFolder}/subtypes/${currentItem.subtype}.png`); // ' + currentItem.subtype + '
    mainContext.drawImage(subtypesImage, subtypeXPosition(i), subtypeYPosition, subtypeWidth, subtypeHeight);
  }

  // Botar uma imagem por cima para tampar as rebarbas
  const imageOver = await loadImage(`${resourcesFolder}/RollsOver.png`);
  mainContext.drawImage(imageOver, 0, 0);

  // Retornar imagem final
  const buffer = mainCanvas.toBuffer('image/png');
  return buffer;
}

async function honkaiWishImage(items) {
  const resourcesFolder = './resources/honkai';

  // Dimensões
  const lines = [
    {
      image: await lineImage(items.slice(0, 3)),
      width: 1112,
      height: 212,
      canvasWidth: 1309,
      canvasHeight: 400,
      finalX: 13,
      finalY: 16
    },
    {
      image: await lineImage(items.slice(3, 7)),
      width: 1460,
      height: 183,
      canvasWidth: 1470,
      canvasHeight: 430,
      finalX: 0,
      finalY: 220
    },
    {
      image: await lineImage(items.slice(7, 10)),
      width: 1112,
      height: 212,
      canvasWidth: 1309,
      canvasHeight: 400,
      finalX: 162,
      finalY: 450
    }
  ]

  // Criar canvas principal e botar background
  const background = await loadImage(`${resourcesFolder}/background.png`);
  const mainCanvas = createCanvas(background.width, background.height);
  const mainContext = mainCanvas.getContext('2d');
  mainContext.drawImage(background, 0, 0);

  // Criar, girar e botar linhas
  for (const line of lines) {
    const lineCanvas = createCanvas(line.canvasWidth, line.canvasHeight);
    const lineContext = lineCanvas.getContext('2d');
    
    const lineX = -line.width / 2;
    const lineY = -line.height / 2;
    lineContext.translate(lineCanvas.width / 2, lineCanvas.height / 2);
    lineContext.rotate(-0.16);
    lineContext.drawImage(line.image, lineX, lineY, line.width, line.height);

    mainContext.drawImage(lineCanvas, line.finalX, line.finalY);
  }

  // Retornar imagem final
  const buffer = mainCanvas.toBuffer('image/png');
  return buffer;
}

async function lineImage(items) {
  const shorterLine = items.length === 3;

  // Dimensões
  const lineWidth = shorterLine ? 1309 : 1754;
  const lineHeight = shorterLine ? 249 : 220;

  const imageXPosition = (i) => {return 445 * i};
  const imageYPosition = 0;
  const imageWidth = 419;
  const imageHeight = 220;

  // Criar canvas principal
  const lineCanvas = createCanvas(lineWidth, lineHeight);
  const lineContext = lineCanvas.getContext('2d');

  // Carregar as imagens do resultado do roll e colocá-las lado a lado
  for (i = 0; i < items.length; i++) {
    const currentItem = items[i];
    
    const itemImage = await generateItemImage(currentItem);
    lineContext.drawImage(itemImage, imageXPosition(i), shorterLine && i === 1 ? imageYPosition + 29 : imageYPosition, imageWidth, imageHeight);
  }

  // Retornar imagem final
  return lineCanvas;
}

async function generateItemImage(item) {
  const resourcesFolder = './resources/honkai';

  // Dimensões
  const starXPosition = 185;
  const starYPosition = 512;
  const starWidth = 266;
  const starHeight = 60;

  const subtypeXPosition = 163;
  const subtypeYPosition = 177;
  const subtypeWidth = 310;
  const subtypeHeight = 310;

  // Background
  const itemBackground = await loadImage(`${resourcesFolder}/itemBackground.png`);
  const itemBackgroundCanvas = createCanvas(itemBackground.width, itemBackground.height);
  const itemBackgroundContext = itemBackgroundCanvas.getContext('2d');
  itemBackgroundContext.drawImage(itemBackground, 0, 0);

  // Weapon
  if (item.type === 'weapon') {
    const imageXPosition = 553;
    const imageYPosition = 39;
    const imageWidth = 615;
    const imageHeight = 860;

    const itemImage = await loadImage(item.image);
    const itemCanvas = createCanvas(imageWidth + 150, imageHeight + 100);
    const itemContext = itemCanvas.getContext('2d');
    itemContext.translate(itemCanvas.width / 2, itemCanvas.height / 2);
    itemContext.rotate(0.16);
    itemContext.drawImage(itemImage, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
  
    itemBackgroundContext.drawImage(itemCanvas, imageXPosition, imageYPosition);
  } else if (item.type === 'character') {
    const imageXPosition = 553;
    const imageYPosition = 0;
    const imageWidth = 771;
    const imageHeight = 742;
    
    const itemImage = await loadImage(getHonkaiFixedURL(item));
    const itemCanvas = createCanvas(imageWidth, imageHeight);
    const itemContext = itemCanvas.getContext('2d');
    itemContext.drawImage(itemImage, 0, 0);
  
    itemBackgroundContext.drawImage(itemCanvas, imageXPosition, imageYPosition);
  }

  // Estrelas e Subtipo
  const starImage = await loadImage(`${resourcesFolder}/stars/star` + item.quality + '.png');
  itemBackgroundContext.drawImage(starImage, starXPosition, starYPosition, starWidth, starHeight);

  const subtypesImage = await loadImage(`${resourcesFolder}/subtypes/${item.subtype}.png`);
  itemBackgroundContext.drawImage(subtypesImage, subtypeXPosition, subtypeYPosition, subtypeWidth, subtypeHeight);

  // Botar uma imagem por cima para tampar as rebarbas
  const imageOver = await loadImage(`${resourcesFolder}/lineOver.png`);
  itemBackgroundContext.drawImage(imageOver, 0, 0);

  // Retornar imagem final
  return itemBackgroundCanvas;
}

async function zzzWishImage(items) {
  const resourcesFolder = './resources/zzz';

  // Dimensões
  const imageXPosition = (i) => {return 88 + (352 * (i % 5))};
  const imageYPosition = (i) => {return i < 5 ? 306 : 546};
  const imageWidth = 339;
  const imageHeight = 229;

  const rankXPosition = (i) => {return 110 + (352 * (i % 5))};
  const rankYPosition = (i) => {return i < 5 ? 429 : 670};
  const rankWidth = 82;
  const rankHeight = 83;

  // Criar canvas principal e botar background
  const background = await loadImage(`${resourcesFolder}/background.png`);
  const mainCanvas = createCanvas(background.width, background.height);
  const mainContext = mainCanvas.getContext('2d');
  mainContext.drawImage(background, 0, 0);

  // Carregar as imagens do resultado do roll e colocá-las lado a lado
  for (i = 0; i < 10; i++) {
    const currentItem = items[i];
    
    const itemImage = await loadImage(getZZZFixedURL(currentItem));
    mainContext.drawImage(itemImage, imageXPosition(i), imageYPosition(i), imageWidth, imageHeight);

    const rankImage = await loadImage(`${resourcesFolder}/ranks/rank` + currentItem.quality + '.png');
    mainContext.drawImage(rankImage, rankXPosition(i), rankYPosition(i), rankWidth, rankHeight);
  }

  // Botar uma imagem por cima para tampar as rebarbas
  const imageOver = await loadImage(`${resourcesFolder}/backgroundOver.png`);
  mainContext.drawImage(imageOver, 0, 0);

  // Retornar imagem final
  const buffer = mainCanvas.toBuffer('image/png');
  return buffer;
}

function getHonkaiFixedURL(item) {
  if (!item.image.startsWith('https://res.cloudinary.com/duwng4tki/image/upload')) return item.image;

  const imageData = item.image.slice(49);
  return 'https://res.cloudinary.com/duwng4tki/image/upload/c_pad,g_south,h_771,w_742' + imageData;
}

function getGenshinFixedURL(item) {
  if (!item.image.startsWith('https://res.cloudinary.com/duwng4tki/image/upload')) return item.image;

  const imageData = item.image.slice(49);
  if (item.type === 'weapon') return 'https://res.cloudinary.com/duwng4tki/image/upload/c_pad,h_500,w_120' + imageData;
  if (item.type === 'character') return 'https://res.cloudinary.com/duwng4tki/image/upload/c_thumb,g_south,h_500,w_120' + imageData;
}

function getZZZFixedURL(item) {
  if (!item.image.startsWith('https://res.cloudinary.com/duwng4tki/image/upload')) return item.image;

  const imageData = item.image.slice(49);
  if (item.type === 'weapon') return 'https://res.cloudinary.com/duwng4tki/image/upload/c_pad,h_229,w_339' + imageData;
  if (item.type === 'character') return 'https://res.cloudinary.com/duwng4tki/image/upload/c_thumb,g_north,h_229,w_339' + imageData;
}

module.exports = { wishTenItemsAndSort, genshinWishImage, honkaiWishImage, zzzWishImage }