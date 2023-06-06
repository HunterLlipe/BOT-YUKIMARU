const { EmbedBuilder } = require("discord.js");
const Vibrant = require("node-vibrant");
const lodash = require('lodash');
const xata = global.xata;

async function transformItemToEmbed(item) {
  const subtypePortuguese = {
    anemo: "Anemo",
    geo: "Geo",
    electro: "Electro",
    dendro: "Dendro",
    hydro: "Hydro",
    pyro: "Pyro",
    cryo: "Cryo",
    sword: "Espada",
    claymore: "Espadão",
    polearm: "Lança",
    catalyst: "Catalisador",
    bow: "Arco",
    physical: "Físico",
    fire: "Fogo",
    ice: "Gelo",
    lightning: "Raio",
    wind: "Vento",
    quantum: "Quântico",
    imaginary: "Imaginário",
    "the destruction": "A Destruição",
    "the hunt": "A Caça",
    "the erudition": "A Erudição",
    "the harmony": "A Harmonia",
    "the nihility": "A Inexistência",
    "the preservation": "A Preservação",
    "the abundance": "A Abundância"
  };

  const typePortuguese = {
    weapon: "Arma",
    character: "Personagem"
  };
  const subtypePortugueseLabel = {
    weapon: "Tipo",
    character: "Visão/Elemento"
  };

  const palette = await Vibrant.from(item.image).getPalette();
  const itemEmbed = new EmbedBuilder()
    .setColor(palette.Vibrant.hex)
    .setTitle(item.name)
    .setDescription(typePortuguese[item.type])
    .addFields(
      { 
        name: "Qualidade",
        value: item.quality.toString(), 
        inline: true 
      },
      {
        name: subtypePortugueseLabel[item.type],
        value: subtypePortuguese[item.subtype],
        inline: true,
      }
    )
    .setImage(item.image);

  return itemEmbed;
}

async function transformBannerToEmbed(banner) {
  const typePortuguese = {
    weapon: "Arma",
    character: "Personagem",
    standard: "Mochileiro"
  };

  const generalItems = (await xata.db.items.read(banner.generalItems)).filter(item => item);
  const boostedItems = generalItems.filter(item => banner.boostedItems.includes(item.id));
  const groupedGeneralItems = groupByProperty(generalItems, 'quality').sort(compare);
  const groupedBoostedItems = groupByProperty(boostedItems, 'quality', true).sort(compare);
  
  const bannerEmbed = new EmbedBuilder()
    .setTitle(`${banner.name} (${banner.command})`)
    .setDescription(typePortuguese[banner.type])
  
  if (groupedGeneralItems.length > 0) bannerEmbed.addFields(groupedGeneralItems);
  if (groupedBoostedItems.length > 0) bannerEmbed.addFields(groupedBoostedItems);

  return bannerEmbed;
}

async function transformWishToEmbed(items, interaction, banner, inventory) {
  const subtypeEmoji = {
    anemo: "<:anemo:840094610264424458>",
    geo: "<:geo:840094566584680449>",
    electro: "<:electro:840094676722778124>",
    dendro: "<:dendro:840094587870904321>",
    hydro: "<:hydro:840094656997621790>",
    pyro: "<:pyro:840094697011675148>",
    cryo: "<:cryo:840094632372207616>",
    sword: "<:espada:936962825220407326>",
    claymore: "<:espado:949051393061314621>",
    polearm: "<:lana:939151478566821908>",
    catalyst: "<:catalisador:936962759743143967>",
    bow: "<:arco:949050876079779860>",
    physical: "<:Fisico:1102816234833195059>",
    fire: "<:Fogo:1102812764763865150>",
    ice: "<:Gelo:1102813504676835359>",
    lightning: "<:Raio:1102813696444608562>",
    wind: "<:Vento:1102814059453222963>",
    quantum: "<:Quantum:1102813896445808650>",
    imaginary: "<:Imaginacao:1102813910085681162>",
    "the destruction": "<:ADestruicao:1102816222577434714>",
    "the hunt": "<:ACaca:1102813436607483974>",
    "the erudition": "<:AErudicao:1102813650655391795>",
    "the harmony": "<:AHarmonia:1102813455087587368>",
    "the nihility": "<:AInexistencia:1102813674990735412>",
    "the preservation": "<:APreservacao:1102813734071717888>",
    "the abundance": "<:AAbundancia:1102813399148134443>"
  };
  const guaranteeWishIndex = {
    'character': 90,
    'weapon': 80,
    'standard': 90
  }
  
  const formattedItems = items.map(item => {
    const itemText = `[${item.quality}★] ${subtypeEmoji[item.subtype]} ${item.name}`;
    return item.quality === 5 ? `**${itemText}**` : itemText;
  });
  const result = lodash.chunk(formattedItems, 5);
  const itemEmbed = new EmbedBuilder()
    .setColor('#e22618')
    .setTitle('Resultado da Oração de ' + interaction.user.username)
    .setThumbnail(interaction.user.avatarURL())
    .addFields({ name: banner.name, value: result[0].join('\n'), inline: true }, { name: '\u200b', value: result[1].join('\n'), inline: true })
    
  if (banner.type && inventory) itemEmbed.setFooter({ text: `Esse foi seu ${JSON.parse(inventory.usageCount)[banner.type]}º desejo. Faltam ${guaranteeWishIndex[banner.type] - JSON.parse(inventory.streakWithout)[banner.type][5]} desejos para um 5 estrelas garantido.` });

  return itemEmbed;
}

function transformRoleToEmbed(role) {
  const roleEmbed = new EmbedBuilder()
    .setTitle(role.title)
    .setDescription(role.description)
    .setThumbnail(role.thumbnail)
    .setImage(role.image)
    .setColor(role.color)

  return roleEmbed;
}

// esperando lançar ARRAY.group... enquanto isso, código roubado (e adaptado)
function groupByProperty(array, property, boosted = false) {
  const groupedItems = array.reduce((result, item) => {
    const key = `[${boosted ? '🆙 ' : ''}${item[property]}★]`;
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});

  return Object.entries(groupedItems).map(([name, value]) => ({
    name,
    value: value.map(item => `\`${item.name}\``).join(', '),
  }));
}

// Ordenador personalizado, código roubado
function compare(a, b) {
  const sortOrder = {
    '[1★]': 0,
    '[2★]': 1,
    '[3★]': 2,
    '[4★]': 3,
    '[5★]': 4,
    '[🆙 4★]': 5,
    '[🆙 5★]': 6
  };

  const aOrder = sortOrder[a.name];
  const bOrder = sortOrder[b.name];

  if (aOrder < bOrder) {
    return -1;
  } else if (aOrder > bOrder) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = { transformItemToEmbed, transformBannerToEmbed, transformWishToEmbed, transformRoleToEmbed };
