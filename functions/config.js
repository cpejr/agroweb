const request = require('request-promise');
const Group = require('../models/group');
const Offer = require('../models/offer');
const fs = require('fs');

class Config {

  static getConfigValue() {
    return new Promise((resolve, reject) => {
      fs.readFile('./docs/config.json', (err, data) => {
        if (err) {
          reject(err);
        }
        const dataJSON = JSON.parse(data);
        // console.log(dataJSON);
        resolve(dataJSON.production);
      });
    });
  }

}

module.exports = Config;
