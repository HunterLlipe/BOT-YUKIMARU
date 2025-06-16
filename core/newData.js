const xata = global.xata;
const Vibrant = require("node-vibrant");

async function newItem (game, name, englishName, type, quality, image, subtype, subtype2, database = xata.db.items, method = 'create') {
  const subtypes = ['anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo', 'sword', 'claymore', 'polearm', 'catalyst', 'bow', 'physical', 'fire', 'ice', 'lightning', 'wind', 'quantum', 'imaginary', 'preservation', 'the destruction', 'the hunt', 'the erudition', 'the harmony', 'the nihility', 'the preservation', 'the abundance',  'remembrance', "attack", "stun", "anomaly", "support", "defense", "fire", "electric", "ice", "physical", "ether", "rupture", "auric ink", "frost"];
  // formatando dados
  game = game.toLowerCase().trim();
  type = type?.toLowerCase().trim();
  subtype = subtype?.toLowerCase().trim();
  subtype2 = subtype2?.toLowerCase().trim();
  quality = parseInt(quality);

  // conferindo dados
  if (!["honkai", "genshin", "zzz"].includes(game)) throw `Jogo inexistente para item ${name}.`;
  if (!["weapon", "character"].includes(type)) throw `Tipo de item inexistente para item ${name}.`;
  if (!subtypes.includes(subtype)) throw `Subtipo de item inexistente para item ${name}.`;
  if (subtype2 && !subtypes.includes(subtype2)) throw `Subtipo 2 de item inexistente para item ${name}.`;
  if (isNaN(quality)) throw `Quantidade de estrelas não é um número para item ${name}.`;
  if (quality < 1 || quality > 5) throw `Quantidade de estrelas errada para item ${name}.`;
  
  return method === 'not' ? {
    game: game,
    name: name,
    englishName: englishName.toLowerCase(),
    type: type,
    quality: quality,
    image: image,
    subtype: subtype,
    subtype2: subtype2 || null
  } : database[method]({
    game: game,
    name: name,
    englishName: englishName.toLowerCase(),
    type: type,
    quality: quality,
    image: image,
    subtype: subtype,
    subtype2: subtype2 || null
  });
}

async function newBanner (game, name, type, command, generalItems, boostedItems, nameColumn = 'name', database = xata.db.banners, method = 'create') {
  // formatando dados
  game = game.toLowerCase();
  type = type?.toLowerCase();
  command = command?.toLowerCase();

  // conferindo dados
  if (!["honkai", "genshin", "zzz"].includes(game)) throw "Jogo inexistente.";
  if (!["weapon", "character", "standard", "chronicled"].includes(type)) throw "Tipo de banner inexistente.";
  
	const itemsData = await xata.db.items.filter({
    game: game,
    $any: {
      name: { $any: [...generalItems, ...boostedItems] },
      englishName: { $any: [...generalItems.map(e => e.toLowerCase()), ...boostedItems.map(e => e.toLowerCase())] }
    }
  }).select(["name", "englishName", "id"]).getAll();
  const generalItemsIDs = itemsData.map(item => item.id);
  const boostedItemsIDs = itemsData.filter(item => boostedItems.map(e => e.toLowerCase()).includes(item[nameColumn].toLowerCase())).map(item => item.id);
  const fails = [...generalItems, ...boostedItems].filter(item => !itemsData.map(item => item[nameColumn].toLowerCase()).includes(item.toLowerCase())).filter(item => item);
  
  const banner = database[method]({
    name: name,
    type: type,
    command: command,
    generalItems: generalItemsIDs,
    boostedItems: boostedItemsIDs,
    game: game
  });
  return {fails, banner};
}

async function newRole (emoji, roleID, title, description, thumbnail, image, color, database = xata.db.roles, method = 'create') {
  if (!color) {
    const palette = await Vibrant.from(thumbnail).getPalette();
    color = palette.Vibrant.hex;
  }

	return database[method]({
    id: roleID,
    emoji: emoji,
    title: title,
    description: description,
    thumbnail: thumbnail,
    image: image,
    color: color
  });
}

module.exports = {newItem, newBanner, newRole};