const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const logError = require('../core/logError');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { transformItemToEmbed, transformBannerToEmbed } = require("../core/embedMaker");
const generate = require('../core/generate');
const { isNot } = require("@xata.io/client");
const sharp = require('sharp'); 

const properties = new SlashCommandBuilder()
  .setName('atualizar')
  .setDescription('Atualizar automaticamente itens e banners com base em conteúdos na internet.')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addSubcommand(subcommand =>
    subcommand
      .setName('banners')
      .setDescription('Atualizar automaticamente banners e itens de um jogo.')
      .addStringOption(option => option.setName('jogo').setDescription('Jogo em que os itens estão.').addChoices(
        { name: 'Genshin Impact', value: 'genshin' },
        { name: 'Honkai: Star Rail', value: 'honkai' },
        { name: 'Zenless Zone Zero', value: 'zzz' }
      ).setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('imagens')
      .setDescription('Envie uma lista de nomes de itens (em inglês) separados por ; para atualizar imagem automaticamente.')
      .addStringOption(option => option.setName('jogo').setDescription('Jogo em que os itens estão.').addChoices(
        { name: 'Genshin Impact', value: 'genshin' },
        { name: 'Honkai: Star Rail', value: 'honkai' },
        { name: 'Zenless Zone Zero', value: 'zzz' }
      ).setRequired(true))
      .addStringOption(option => option.setName('lista').setDescription('Lista de itens para serem cadastrados.').setRequired(true)));
      
async function execute (interaction) {
  await interaction.deferReply();

  const chosenCommand = interaction.options.getSubcommand();
  const game = interaction.options.getString('jogo'); 
  
  if (chosenCommand === 'banners') {
    await interaction.editReply({
      content: `🔎 Buscando banners... - 0%`
    });

    const wikiasConfig = {
      'genshin': {url: 'https://genshin-impact.fandom.com/wiki/Genshin_Impact_Wiki', bannerLabel: 'Current Wishes\n', querySelector: '.Mainpage-header', exclude: ['https://genshin-impact.fandom.com/wiki/Beginners%27_Wish', 'https://genshin-impact.fandom.com/wiki/Wanderlust_Invocation']},
      'honkai': {url: 'https://honkai-star-rail.fandom.com/wiki/Honkai:_Star_Rail_Wiki', bannerLabel: 'Current Warps\n', querySelector: '.Mainpage-header', exclude: ['https://honkai-star-rail.fandom.com/wiki/Departure_Warp', 'https://honkai-star-rail.fandom.com/wiki/Stellar_Warp']},
      'zzz': {url: 'https://zenless-zone-zero.fandom.com/wiki/Zenless_Zone_Zero_Wiki', bannerLabel: 'Signal Searches', querySelector: '.mainpage-left-header', exclude: ['https://zenless-zone-zero.fandom.com/wiki/An_Outstanding_Partner', 'https://zenless-zone-zero.fandom.com/wiki/Star-Studded_Cast']}
    }
    const gameConfig = wikiasConfig[game];

    const {data: wikiaDOM} = await axios.get(gameConfig.url);
    const { document } = (new JSDOM(wikiaDOM)).window;
    const aElements = Array.from(document.querySelectorAll(gameConfig.querySelector)).find(e => e.textContent == gameConfig.bannerLabel).parentNode.parentNode.parentNode.querySelectorAll('a.image.link-internal');
    const bannersURLs = Array.from(aElements).map(e => gameConfig.url.replace(/(.*)\/wiki\/.*/g, '$1') + e.href).filter(e => !gameConfig.exclude.includes(e));
    
    await interaction.editReply({
      content: `⏳ Deletando todos os banners... - ${Math.floor((1/(bannersURLs.length + 2)) * 100)}%`
    });

    const bannersToDelete = await xata.db.banners.filter("game", game).filter("type", isNot("standard")).getAll();
    for (const banner of bannersToDelete) {
      await banner.delete();
    }
    
    for (const url of bannersURLs) {
      const i = bannersURLs.indexOf(url);

      await interaction.editReply({
        content: `${['⌛', '⏳'][i % 2]} Gerando banners... - ${Math.floor((2 + i)/(bannersURLs.length + 2) * 100)}%`
      });

      const bannerResponse = await generate[game + "Banner"](url);
      let banner = await bannerResponse.banner;
      let fails = await bannerResponse.fails;

      if (fails.length > 0) {
        const itemResponse = await generate[game + "Items"](fails);
        const itemsEmbeds = itemResponse.items.length > 10 ? [] : await Promise.all(itemResponse.items.map(async (item) => await transformItemToEmbed(item)));
        interaction.followUp({
          content: `**Falhas:** ${itemResponse.fails.length > 0 ? response.fails.join(';') : 'Nenhuma falha.'}\n**Cadastrados:** ${itemResponse.items.length <= 10 ? '' : itemResponse.items.map(item => item.name).join(', ')}`, 
          embeds: itemsEmbeds
        });

        const updateBannerResponse = await generate[game + "Banner"](url);
        banner = await updateBannerResponse.banner;
        fails = await updateBannerResponse.fails;
      }

      const bannerEmbed = await transformBannerToEmbed(banner);
      await interaction.followUp({
        content: `**Falhas:** ${fails.length > 0 ? fails.map(item => item).join(';') : 'Nenhuma falha.'}\n**Banner cadastrado:**`, 
        embeds: [bannerEmbed]
      });
    }

    interaction.editReply({
      content: `✅ Banners atualizados. - 100%`
    });
  } else if (chosenCommand === 'imagens') {
    const fails = [];
    const newItems = [];
    let imageURL = '';

    const listAsString = interaction.options.getString('lista');
    const itemsNames = listAsString.split(";").filter(item => item);
    const itemsData = await xata.db.items.filter({
      game: game,
      $any: {
        name: { $any: itemsNames },
        englishName: { $any: itemsNames.map(e => e.toLowerCase()) }
      }
    }).getAll();

    for (const item of itemsData) {
      try {
        imageURL = await generate[game + "Image"](item.name, item.type);
  
        // converter imagem para PNG
        const imageFileWEBP = await axios.get(imageURL, {
          responseType: 'arraybuffer',
        });
        const imageFilePNG = await sharp(imageFileWEBP.data).toFormat('png').toBuffer();
        const imageUpload = await cloudinary.uploader.upload('data:image/png;base64,' + imageFilePNG.toString('base64'));
        imageURL = imageUpload.secure_url;

        const updatedItem = await item.update({image: imageURL});
        newItems.push(updatedItem);
      } catch (error) {
        logError(error, 'gerar imagem para ' + item.name)
        fails.push(item.name);
        continue;
      }
    }
    
    const embeds = newItems.length > 10 ? [] : await Promise.all(newItems.map(async (item) => await transformItemToEmbed(item)));
    interaction.editReply({
      content: `**Falhas:** ${fails.length > 0 ? fails.join(';') : 'Nenhuma falha.'}\n**Cadastrados:** ${newItems.length <= 10 ? '' : newItems.map(item => item.name).join(', ')}`, 
      embeds: embeds
    });
  }
}

module.exports = { properties, execute };