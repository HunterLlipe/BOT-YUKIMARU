"use strict";

async function setChannel (message, db) {

  db.set("guild", message.guild.id).then(() => {

    db.set("channel", message.channel.id).then(async () => {

      if (message.guild == null) message.delete();

      const sendMessage = await message.channel.send('Canal de notícias definido!');
      setTimeout(() => {

        sendMessage.delete();
    
      }, 1500)

    }).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao salvar o canal. Erro: " + e))

  }).catch(e => message.channel.send("<@555429270919446549> - Houve um erro ao salvar o servidor. Erro: " + e))

}

module.exports = {setChannel}