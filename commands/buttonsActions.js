"use strict";

const global = require("./commands/_global");
const requireFromString = require("require-from-string");
const fs = require("fs");

function listItem (interaction, disbut, wixData) {

  //1_index_args[1]
  const items = requireFromString(fs.readFileSync("./commands/items.js","utf8"));
  const parameters = interaction.id.split("_")
  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) items.list(interaction.message, [parameters[1], parameters[2]], disbut, wixData, true, interaction)
  
}

function listBanner (interaction, disbut, wixData) {

  //2_index_args[1]
  const items = requireFromString(fs.readFileSync("./commands/banners.js","utf8"));
  const parameters = interaction.id.split("_")
  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) items.list(interaction.message, [parameters[1], parameters[2]], disbut, wixData, true, interaction)
  
}

function listMaterial (interaction, disbut, wixData, db) {

  //message, args, disbut, db, edit, interaction
  const materials = requireFromString(fs.readFileSync("./commands/materials.js","utf8"));
  const parameters = interaction.id.split("_")
  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) materials.list(interaction.message, [parameters[1], parameters[2]], disbut, db, true, interaction)
  
}

function listRecipes (interaction, disbut) {

  const recipes = requireFromString(fs.readFileSync("./commands/recipes.js","utf8"));
  const forge = requireFromString(fs.readFileSync("./commands/forge.js","utf8"));
  const alchemies = requireFromString(fs.readFileSync("./commands/alchemies.js","utf8"));
  const parameters = interaction.id.split("_")
  const functions = [recipes.listRecipes, forge.listForges, alchemies.listAlchemies]

  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) functions[parameters[1]](interaction.message, [parameters[2], parameters[3]], disbut, true, interaction)
  
}

function listArtifacts (interaction, disbut) {

  const artifacts = requireFromString(fs.readFileSync("./commands/artifacts.js","utf8"));
  const parameters = interaction.id.split("_")
  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) artifacts.listArtifacts(interaction.message, [parameters[1], parameters[2]], disbut, true, interaction)
  
}

function talents (interaction, disbut) {

  const itemsTalents = requireFromString(fs.readFileSync("./commands/itemsTalents.js","utf8"));
  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) itemsTalents.generateTalents(encodeURIComponent(interaction.message.embeds[0].author.name.replace(/ /g, "_")), interaction.id.split("_")[1], interaction.message, interaction.message.embeds[0], true, disbut, interaction)

}

function ascension (interaction, disbut) {

  const itemsAscensions = requireFromString(fs.readFileSync("./commands/itemsAscensions.js","utf8"));

  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) itemsAscensions.generateAscension(encodeURIComponent(interaction.message.embeds[0].author.name.replace(/ /g, "_")), ["personagem", "arma"].indexOf(interaction.message.embeds[0].footer.text.match(/personagem|arma/i)[0].toLowerCase()), interaction.id.split("_")[1].match(/\d+/)[0], interaction.message, interaction.message.embeds[0], disbut, true, interaction)

  //(name, type, level, message, embed, disbut, edit, interaction)
  //itemsOperation.generateAscension(capitalize(interaction.message.embeds[0].author.name).substr(1).replace(/ /g, "_"), ["character", "weapon"].indexOf(star[i][j].type), interaction.id.split(" ")[1][0], interaction.message, interaction.message.embeds[0], disbut, true, interaction);

}

function constelaciones (interaction, disbut) {

  const itemsConstelaciones = requireFromString(fs.readFileSync("./commands/itemsConstelaciones.js","utf8"));

  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) itemsConstelaciones.generateConstelaciones(encodeURIComponent(interaction.message.embeds[0].author.name.replace(/ /g, "_")), interaction.id.split("_")[1], interaction.message, interaction.message.embeds[0], true, disbut, interaction)

  // (name, type, message, embed, edit, disbut, interaction) 

}

function passives (interaction, disbut) {

  const itemsPassives = requireFromString(fs.readFileSync("./commands/itemsPassives.js","utf8"));

  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) itemsPassives.generatePassives(encodeURIComponent(interaction.message.embeds[0].author.name.replace(/ /g, "_")), interaction.message, interaction.id.split("_")[1], interaction.message.embeds[0], disbut, true, interaction)

  // generatePassives (name, message, level, embed, disbut, edit, interaction)

}

function recipes (interaction, disbut) {

  const recipes = requireFromString(fs.readFileSync("./commands/recipes.js","utf8"));

  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) recipes.recipe(interaction.message, [interaction.message.embeds[0].author.name, interaction.id.split("_")[1]], true, disbut, interaction)

  // (message, args, edit, disbut, interaction)

}

function artifacts (interaction, disbut) {

  const artifacts = requireFromString(fs.readFileSync("./commands/artifacts.js","utf8"));

  if (interaction.clicker.user.id == interaction.message.mentions.users.first().id) artifacts.artifact(interaction.message, [interaction.message.embeds[0].author.name, interaction.id.split("_")[1]], disbut, true, interaction)

  //artifact (message, args, disbut, edit, interaction)

}

module.exports = {listItem, listBanner, listMaterial, listRecipes, listArtifacts, talents, ascension, constelaciones, passives, recipes, artifacts};