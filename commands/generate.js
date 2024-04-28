const { SlashCommandBuilder } = require('discord.js');
const lodash = require('lodash');
const { transformItemToEmbed, transformBannerToEmbed } = require("../core/embedMaker");
const generate = require('../core/generate');

const properties = new SlashCommandBuilder()
  .setName('gerar')
  .setDescription('Gerar e cadastrar automaticamente itens e banners com base em conteúdos na internet.')
  .setDefaultMemberPermissions(0)
  .setDMPermission(false)
  .addSubcommand(subcommand =>
    subcommand
      .setName('banner')
      .setDescription('Envie um link para automaticamente cadastrar um banner.')
      .addStringOption(option => option.setName('jogo').setDescription('Jogo em que os itens estão.').addChoices(
        { name: 'Genshin Impact', value: 'genshin' },
        { name: 'Honkai: Star Rail', value: 'honkai' },
      ).setRequired(true))
      .addStringOption(option => option.setName('link').setDescription('Link para basear o cadastro').setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('itens')
      .setDescription('Envie uma lista de nomes de itens (em inglês) separados por ; para serem automaticamente cadastrados')
      .addStringOption(option => option.setName('jogo').setDescription('Jogo em que os itens estão.').addChoices(
        { name: 'Genshin Impact', value: 'genshin' },
        { name: 'Honkai: Star Rail', value: 'honkai' },
      ).setRequired(true))
      .addStringOption(option => option.setName('lista').setDescription('Lista de itens para serem cadastrados.').setRequired(true)));

async function execute (interaction) {
  await interaction.deferReply();

  const chosenCommand = interaction.options.getSubcommand();
  const game = interaction.options.getString('jogo'); 

  if (chosenCommand === 'itens') {
    const listAsString = interaction.options.getString('lista');
    const items = listAsString.split(";").filter(item => item);
    
    const response = await generate[game + "Items"](items);
    const embeds = response.items.length > 10 ? [] : await Promise.all(response.items.map(async (item) => await transformItemToEmbed(item)));
    interaction.editReply({
      content: `**Falhas:** ${response.fails.length > 0 ? response.fails.join(';') : 'Nenhuma falha.'}\n**Cadastrados:** ${response.items.length <= 10 ? '' : response.items.map(item => item.name).join(', ')}`, 
      embeds: embeds
    });
  } else if (chosenCommand === 'banner') {
    const rawLink = interaction.options.getString('link');
    const link = game === 'genshin' ? rawLink.match(/^https:\/\/genshin-impact\.fandom\.com.*?\/wiki\/(.*)/) : rawLink.match(/^https:\/\/honkai-star-rail\.fandom\.com.*?\/wiki\/(.*)/);
    if (!link) throw "Link inválido ou impossibilidade de gerar banner através dele.";

    const response = await generate[game + "Banner"](rawLink);
    const banner = await response.banner;
    const embed = await transformBannerToEmbed(banner);
    interaction.editReply({
      content: `**Falhas:** ${response.fails.length > 0 ? response.fails.map(item => lodash.startCase(item)).join(';') : 'Nenhuma falha.'}\n**Banner cadastrado:**`, 
      embeds: [embed]
    });
  }
}

module.exports = { properties, execute };