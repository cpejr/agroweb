const request = require('request-promise');
const Group = require('../models/group');
const Offer = require('../models/offer');

class Money {
  /**
   * Get the dollar commercial quotation
   * @returns {null}
   */
  static getUsdValue() {
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
}

module.exports = Money;
