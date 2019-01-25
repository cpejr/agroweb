const request = require('request-promise');
const Group = require('../models/group');
const Offer = require('../models/offer');
const fs = require('fs');

class Money {
  /**
   * Get the dollar commercial quotation
   * @returns {Number} Dollar value
   */
  static getUsdValue() {
    return new Promise((resolve, reject) => {
      fs.readFile('./docs/dollar.json', (err, data) => {
        if (err) {
          reject(err);
        }
        const dataJSON = JSON.parse(data);
        resolve(dataJSON.ask);
      });
    });
  }

  /**
   * Get the ptax quotation
   * @returns {Number} Ptax value
   */
  static getPtaxValue() {
    return new Promise((resolve, reject) => {
      fs.readFile('./docs/ptax.json', (err, data) => {
        if (err) {
          reject(err);
        }
        const dataJSON = JSON.parse(data);
        resolve(dataJSON.ptax);
      });
    });
  }

  /**
   * Update the ptax value
   * @param {Number} ptax - Ptax Value
   * @returns {null}
   */
  static ptaxUpdate(ptax) {
    return new Promise((resolve, reject) => {
      const object = {
        ptax
      };
      fs.writeFile('./docs/ptax.json', JSON.stringify(object), (err) => {
        if (err) {
          reject(err);
        }
        console.log('The ptax file has been saved!');
        resolve();
      });
    });
  }

  /**
   * Get the dollar quotation and update the database
   * @returns {null}
   */
  static dailyDollarUpdate() {
    Money.getUsdValue().then((dollar) => {
      console.log(dollar);
      Group.getAll().then((groups) => {
        groups.forEach((group) => {
          Offer.getByQuerySorted(
            {
              product: group.productId,
              delivery: { $ne: '48 horas' }
            },
            {}
          ).then((offers) => {
            offers.forEach((offer) => {
              if (group.offer._id != offer._id) {
                let offerGroupPrice = ((group.offer.price.high * 3) + (group.offer.price.average * 1)) / 4;
                let offerPrice = ((offer.price.high * 3) + (offer.price.average * 1)) / 4;
                if (group.offer.usd) {
                  offerGroupPrice *= dollar;
                }
                if (offer.usd) {
                  offerPrice *= dollar;
                }
                if (offerGroupPrice < offerPrice) {
                  const groupData = {
                    offer: offer._id
                  };
                  Group.update(group._id, groupData).catch((err) => {
                    console.log(err);
                  });
                }
                else if (offerGroupPrice === offerPrice) {
                  if (group.offer.stock < offer.stock) {
                    const groupData = {
                      offer: offer._id
                    };
                    Group.update(group._id, groupData).catch((err) => {
                      console.log(err);
                    });
                  }
                }
              }
            });
          }).catch((error) => {
            console.log(error);
          });
        });
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Get the dollar quotation and create a JSON
   * @returns {null}
   */
  static createDollarJSON() {
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        url: 'https://economia.awesomeapi.com.br/json/USD-BRL/1',
        json: true,
        resolveWithFullResponse: true
      }).then((response) => {
        if (response.err) {
          console.log(response.err);
          reject(response.err);
        }
        fs.writeFile('./docs/dollar.json', JSON.stringify(response.body[0]), (err) => {
          if (err) {
            reject(err);
          }
          console.log('The dollar file has been saved!');
          resolve();
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Money;
