const request = require('request-promise');

module.exports = {
  getUsdValue() {
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        url: 'https://economia.awesomeapi.com.br/json/USD-BRL/1',
        json: true,
        resolveWithFullResponse: true
      }).then((response) => {
        if (response.err) {
          console.log(response.err);
          resolve(response.err);
        }
        resolve(response.body[0].ask);
      }).catch((err) => {
        reject(err);
      });
    });
  }
};
