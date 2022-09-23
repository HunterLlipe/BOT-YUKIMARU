"use strict";

const discordjs = require('discord.js');
const axios = require('axios');

let complete = "";
let complete2 = "";

//console.log(await db.set("newsGuild", "012389012381"));
//console.log(await db.get("newsGuild"))

async function add (message, args, db) {

  let dbNum = "";
  if (args[2]) dbNum = args[2];
  let roles = await db.get("roles" + dbNum);
  if (roles == null) roles = [];

  if (args[1] == undefined) args[1] = "";

  if (args[0].startsWith('<@&') && args[0].endsWith('>') && /\p{Extended_Pictographic}/u.test(args[1]) && message.member.hasPermission('ADMINISTRATOR') || args[0].startsWith('<@&') && args[0].endsWith('>') && args[1].startsWith('<:') && message.member.hasPermission('ADMINISTRATOR')) {

    let alr = false;

    for (let i = 0; i < roles.length; i++) {

      if (roles[i].emojo == args[1]) alr = true;
      if (roles[i].id == args[0]) alr = true;

    }

    if (alr == false) {

      message.reply(`O ${args[1]} foi vinculado ao cargo ${args[0]} na lista "${dbNum}". Envie \`!cargo-list ${dbNum}\` para enviar a lista atualizada.`);
      roles.push({
          emojo: args[1],
          id: args[0]
        }
      );
      
      await db.set("roles" + dbNum, roles);

    } else {

      message.channel.send(`Esse cargo e/ou emoji já está sendo usado na lista "${dbNum}".`);

    }

  } else if (!message.member.hasPermission('ADMINISTRATOR')) {

    message.reply('você não tem permissão para fazer isso.');
  
  } else {

    message.channel.send('Nenhum cargo e/ou emoji foi citado.');

  }

}

async function remove (message, args, db) {

  let dbNum = "";
  if (args[1]) dbNum = args[1];
  let roles = await db.get("roles" + dbNum);
  if (roles == null) roles = [];
  let nfound;

  for (let i = 0; i < roles.length; i++) {

    if (roles[i].emojo == args[0]) {

      message.channel.send(`O cargo ${roles[i].id} foi removido da lista "${dbNum}". Envie \`!cargo-list ${dbNum}\` para enviar a lista atualizada.`);

      roles.splice(i, 1);
    
      await db.set("roles" + dbNum, roles);
      nfound = false;
      break;

    } else {

      nfound = true;

    }

  }

  if (nfound == true) message.channel.send(`Nenhum cargo **cadastrado no bot** achado para ${args[0]}.`);

}

async function list (message, db, args) {
try {
  
  if (message.guild == null) message.delete();

  let dbNum = "";
  if (args[0] && args[0] != '!cargo-list') dbNum = args[0];
  let roles = await db.get("roles" + dbNum);

  if (roles == null) roles = [];

  complete = "";
  complete2 = "";
  let i;

  for (i = 0; i < Math.ceil(roles.length / 2); i++) {

    complete = complete + roles[i].emojo + " - " + roles[i].id + "\n"

  }

  for (i = Math.ceil(roles.length / 2); i < roles.length; i++) {

    complete2 = complete2 + roles[i].emojo + " - " + roles[i].id + "\n"

  }
  
  let cargolistres;
  
  if (message.attachments.size > 0 && message.attachments.first().name.toLowerCase().endsWith(".json")) {
    cargolistres = (await axios.get(message.attachments.first().url)).data;
  } else {
    cargolistres = {
    	color: '#0099ff',
    	title: 'Cargos',
    	description: 'Escolha um cargo reagindo com os emojis.',
      fields: []
    };
    
    if (complete.length > 0) { 
      cargolistres.fields.push({
    			name: '\u200b',
    			value: complete,
    			inline: true,
    	});
    }
    if (complete2.length > 0) { 
      cargolistres.fields.push({
    			name: '\u200b',
    			value: complete2,
    			inline: true,
    	});
    }
  }
  
  const toreact = await message.channel.send({ embed: cargolistres });

  for (i = 0; i < roles.length; i++) {

    if (i % 2 == 0) toreact.react(roles[i].emojo.replace(/<:.*?:(.*)>/, "$1"));

  }

  for (i = 0; i < roles.length; i++) {

    if (i % 2 == 1) toreact.react(roles[i].emojo.replace(/<:.*?:(.*)>/, "$1"));

  }

  let previousMsg;
  let rolesMsg = await db.get("rolesMsg");
  if (rolesMsg) { 
    previousMsg = Object.entries(rolesMsg).find(e => e[1] == dbNum);
    if (previousMsg) delete rolesMsg[previousMsg[0]];
  } else {
    rolesMsg = {};
  }
  rolesMsg[toreact.id] = dbNum;
  await db.set("rolesMsg", rolesMsg);
  
} catch (error) {
  console.log(`Mensagem: ${message.content}\n\n${error}`)
}
}

module.exports = {add, remove, list};