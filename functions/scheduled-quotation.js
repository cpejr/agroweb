const Group = require('../models/group');
const Offer = require('../models/offer');
const Dollar = require('./money');

module.exports = {
  /**
   * Get the dollar quotation and update the database
   * @returns {null}
   */
  dailyDollarUpdate() {
    console.log('FUNÇÃO PERIODICA');
    Dollar.getUsdValue().then((dollar) => {
      console.log(dollar);
      Group.getAll().then((groups) => {
        groups.forEach((group) => {
          Offer.getByQuerySorted({
            product: group.productId,
            delivery: { $ne: 'em até 48 horas' }
          }, {}).then((offers) => {
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
};
