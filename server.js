"use strict";

const app = require('express')();
const requireFromString = require("require-from-string");
const fs = require('fs');

let botReference, db;

app.get('/', (req, res) => { 

  res.send("Yukimaru Release Server online! v1.0");
  
  if (req.query.parameters) {
  
    const sendNews = requireFromString(fs.readFileSync("./newsSystem/sendNews.js","utf8"));
    
    const functions = [sendNews.news, sendNews.video, sendNews.stream, sendNews.tweet];
    const variables = {"title": req.query.title, "link": req.query.link, "date": req.query.date, "image": req.query.image, "game": req.query.game, "botReference": botReference, "db": db };
    const parameters = req.query.parameters.split(',').map(e => Object.values(variables)[Object.keys(variables).indexOf(e)])
    functions[parseInt(req.query.type)](...parameters)

  }
  
});

app.use(require('body-parser').urlencoded({ extended: false }));
app.post('*', (req, res) => {

  res.send("Servidor Online");

  if (req.body.parameters) {
  
    const sendNews = requireFromString(fs.readFileSync("./newsSystem/sendNews.js","utf8"));
    
    const functions = [sendNews.news, sendNews.video, sendNews.stream, sendNews.tweet];
    const variables = {"title": req.body.title, "link": req.body.link, "date": req.body.date, "image": req.body.image, "game": req.body.game, "botReference": botReference, "db": db };
    const parameters = req.body.parameters.split(',').map(e => Object.values(variables)[Object.keys(variables).indexOf(e)])
    functions[parseInt(req.body.type)](...parameters)

  }

});

module.exports = (bot, newsSettings) => {
  app.listen(3000);
  botReference = bot;
  db = newsSettings
}