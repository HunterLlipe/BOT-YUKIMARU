"use strict";

const axios = require('axios');

async function update (message, db) {

  let materials = await db.get("materials");
  if (!materials) materials = [];
  let toEdit = await message.reply("Processando lista... " + materials.length + " itens atualmente.")
  let listFinal = [];
  const categorys = ["Materiais_para_Forjamento", "Materiais_Comuns_de_Ascensão", "Materiais_de_Ascensão_de_Armas", "Materiais_de_Fortalecimento_de_Arma", "Materiais_de_Elevação_de_Talento", "Material_de_EXP_de_Personagem", "Materiais"];

  //código porco, eu sei, mas não dava pra fazer loop aqui. tentei.
  
  axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:${encodeURIComponent(categorys[0])}&cmlimit=500&format=json`).then((res) => {
      
    res.data.query.categorymembers.filter((item) => !item.title.startsWith("Categoria:")).filter((item) => !(item.title == categorys[0].replace(/_/g, " "))).forEach((item) => listFinal.push(item.title))

    axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:${encodeURIComponent(categorys[1])}&cmlimit=500&format=json`).then((res) => {
      
      res.data.query.categorymembers.filter((item) => !item.title.startsWith("Categoria:")).filter((item) => !(item.title == categorys[1].replace(/_/g, " "))).forEach((item) => listFinal.push(item.title))

      axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:${encodeURIComponent(categorys[2])}&cmlimit=500&format=json`).then((res) => {
      
        res.data.query.categorymembers.filter((item) => !item.title.startsWith("Categoria:")).filter((item) => !(item.title == categorys[2].replace(/_/g, " "))).forEach((item) => listFinal.push(item.title))

        axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:${encodeURIComponent(categorys[3])}&cmlimit=500&format=json`).then((res) => {
      
          res.data.query.categorymembers.filter((item) => !item.title.startsWith("Categoria:")).filter((item) => !(item.title == categorys[3].replace(/_/g, " "))).forEach((item) => listFinal.push(item.title))

          axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:${encodeURIComponent(categorys[4])}&cmlimit=500&format=json`).then((res) => {
      
            res.data.query.categorymembers.filter((item) => !item.title.startsWith("Categoria:")).filter((item) => !(item.title == categorys[4].replace(/_/g, " "))).forEach((item) => listFinal.push(item.title))

            axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:${encodeURIComponent(categorys[5])}&cmlimit=500&format=json`).then((res) => {
      
              res.data.query.categorymembers.filter((item) => !item.title.startsWith("Categoria:")).filter((item) => !(item.title == categorys[5].replace(/_/g, " "))).forEach((item) => listFinal.push(item.title))

              axios.get(`https://genshin-impact.fandom.com/pt-br/api.php?action=query&list=categorymembers&cmtitle=Categoria:${encodeURIComponent(categorys[6])}&cmlimit=500&format=json`).then((res) => {
      
                res.data.query.categorymembers.filter((item) => !item.title.startsWith("Categoria:")).filter((item) => !(item.title == categorys[6].replace(/_/g, " "))).forEach((item) => listFinal.push(item.title))

                listFinal = listFinal.filter(function(item, pos, self) { return self.indexOf(item) == pos; })

                db.set("materials", listFinal).then(() => toEdit.edit("Dados atualizados. " + listFinal.length + " itens atualmente."));

              }).catch(e => console.log(7, e));

            }).catch(e => console.log(6, e));

          }).catch(e => console.log(5, e));

        }).catch(e => console.log(4, e));

      }).catch(e => console.log(3, e));

    }).catch(e => console.log(2, e));

  }).catch(e => console.log(1, e));

}

module.exports = {update};