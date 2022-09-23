const axios = require("axios");
const qs = require('qs');

async function set (key, value) {
  return new Promise(async (resolve, reject) => {
    parsedData = qs.stringify({
      "key": key,
      "value": JSON.stringify(value)
    });
    axios({
      method: 'post',
      url: `https://database.enzon19.repl.co/set`,
      headers: { 
      'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: parsedData
    }).then((response) => {
      resolve(response.data);
    }).catch((err) => reject(err));
  });
}

async function get (key) {
  return new Promise(async (resolve, reject) => {
    axios.get(`https://database.enzon19.repl.co/get?key=${key}`).then((response) => {
      resolve(response.data);
    }).catch((err) => reject(err));
  });
}

module.exports = {set, get}