const logError = require('../core/logError');
const bot = global.bot;

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(user) {
    bot.users.send(user.id, {
      "embeds": [
        {
          "color": 14623009,
          "image": {
              "url": "https://cdn.discordapp.com/attachments/982374337107595294/1284918849954644028/Comm_Llipe_c_fundo_colorido_1.png?ex=6793c46e&is=679272ee&hm=37b1f4fe43517eadcd7f69a00c8e09828153cde54bf8f8449423712a480bffdd&"
          },
          "footer": {
              "text": "Taverna Hunter",
              "icon_url": "https://cdn.discordapp.com/attachments/982374337107595294/1284918849954644028/Comm_Llipe_c_fundo_colorido_1.png?ex=6793c46e&is=679272ee&hm=37b1f4fe43517eadcd7f69a00c8e09828153cde54bf8f8449423712a480bffdd&"
          },
          "title": "Torne-se um Hunter!",
          "description": "Seja bem-vindo (a) à Taverna Hunter. Sou o Informante Yukimaru e estou aqui para lhe ajudar. Na nossa Taverna, você vai poder ficar por dentro das novidades do jogos da HoYo, além de poder sair para Expedições com Hunters de diferentes categorias!\n\nFalta pouco para que você seja um Hunter, para continuar com a inscrição, você só tem que fazer os seguintes passos:\n\n1️⃣ Ler as regras em https://discord.com/channels/825292359960887317/825292359960887320 e **aceitar com a reação de <:licenca_hunter:982397517390037012>**;\n2️⃣ Assim que aceitar as regras, você vai liberar o canal https://discord.com/channels/825292359960887317/982365398928347176 para **escolher seus cargos, reagido com a reação específica** de cada um."
        }
      ]
    });
  }
};