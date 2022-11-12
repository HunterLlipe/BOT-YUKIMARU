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

module.exports = {listItem, listBanner};