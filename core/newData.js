const xata = global.xata;
const Vibrant = require("node-vibrant");

async function newItem (game, name, type, quality, image, subtype, englishName, database = xata.db.items, method = 'create') {
  const subtypes = ['anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo', 'sword', 'claymore', 'polearm', 'catalyst', 'bow', 'physical', 'fire', 'ice', 'lightning', 'wind', 'quantum', 'imaginary', 'the destruction', 'the hunt', 'the erudition', 'the harmony', 'the nihility', 'the preservation', 'the abundance'];
  // formatando dados
  game = game.toLowerCase();
  type = type.toLowerCase();
  subtype = subtype.toLowerCase();
  quality = parseInt(quality);

  // conferindo dados
  if (!["honkai", "genshin"].includes(game)) throw "Jogo inexistente.";
  if (!["weapon", "character"].includes(type)) throw "Tipo de item inexistente.";
  if (!subtypes.includes(subtype)) throw "Subtipo de item inexistente.";
  if (isNaN(quality)) throw "Quantidade de estrelas não é um número.";
  if (quality < 1 || quality > 5) throw "Quantidade de estrelas errada.";

  return database[method]({
    name: name,
    englishName: englishName.toLowerCase(),
    quality: quality,
    type: type,
    subtype: subtype,
    image: image,
    game: game
  });
}

async function newBanner (game, name, type, command, generalItems, boostedItems, nameColumn = 'name', database = xata.db.banners, method = 'create') {
  // formatando dados
  game = game.toLowerCase();
  type = type.toLowerCase();
  command = command.toLowerCase();

  // conferindo dados
  if (!["honkai", "genshin"].includes(game)) throw "Jogo inexistente.";
  if (!["weapon", "character", "standard"].includes(type)) throw "Tipo de banner inexistente.";

	const itemsData = await xata.db.items.filter({
    game: game,
    $any: {
      name: { $any: [...generalItems, ...boostedItems] },
      englishName: { $any: [...generalItems, ...boostedItems] }
    }
  }).select(["name", "englishName", "id"]).getAll();
  const generalItemsIDs = itemsData.map(item => item.id);
  const boostedItemsIDs = itemsData.filter(item => boostedItems.includes(item[nameColumn])).map(item => item.id);
  const fails = [...generalItems, ...boostedItems].filter(item => !itemsData.map(item => item[nameColumn]).includes(item));

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
  // conferindo dados
  // em breve...

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