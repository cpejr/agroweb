const Email = require('../models/email');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Transaction = require('../models/transaction');
const User = require('../models/user');

class Delivery {
  /**
   * Ends all groups that have reached the deadline date
   */
  static closeGroups() {
    return new Promise((resolve, reject) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cropDate = global.config.date.crop;
      const smallCropDate = global.config.date.smallCrop;

      const crop = new Date(today);
      crop.setDate(Number(cropDate.slice(0, 2)));
      crop.setMonth(Number(cropDate.slice(-2)) - 1);

      const smallCrop = new Date(today);
      smallCrop.setDate(Number(smallCropDate.slice(0, 2)));
      smallCrop.setMonth(Number(smallCropDate.slice(-2)) - 1);

      if (today.getTime() > crop.getTime()) {
        crop.setFullYear(crop.getFullYear() + 1);
      }

      if (today.getTime() > smallCrop.getTime()) {
        smallCrop.setFullYear(smallCrop.getFullYear() + 1);
      }

      const cropCloseDate = new Date(crop);
      const smallCropCloseDate = new Date(smallCrop);
      const cropDateString = `${crop.getFullYear()}/${crop.getFullYear() + 1}`;
      const smallCropDateString = smallCrop.getFullYear();

      if (today.getTime() === crop.getTime()) {
        cropCloseDate.setFullYear(crop.getFullYear() + 1);
      }

      if (today.getTime() === smallCrop.getTime()) {
        smallCropCloseDate.setFullYear(crop.getFullYear() + 1);
      }

      cropCloseDate.setDate(cropCloseDate.getDate() - 15);
      smallCropCloseDate.setDate(smallCropCloseDate.getDate() - 15);

      Group.getAll().then((groups) => {
        groups.forEach((group) => {
          let groupData = {};
          if (group.closeDate.getTime() === today.getTime()) {
            groupData.active = false;
            Group.update(group._id, groupData).catch((error) => {
              console.log(error);
              reject(error);
            });
          }
          if (crop.getTime() === today.getTime()) {
            if (group.delivery === 'Safra') {
              Group.getAllTransactions().then((transactions) => {
                transactions.forEach((transaction) => {
                  const dataClient = {
                    name: transaction.buyer.firstName,
                    email: transaction.buyer.email
                  };
                  const transactionData = {
                    status: 'Cancelado'
                  };
                  if (transaction.status === 'Cotado') {
                    User.removeFromMyCart(transaction.buyer._id, transaction._id).catch((error) => {
                      console.log(error);
                      reject(error);
                    });
                    if (transaction.franchisee) {
                      User.removeFromMyCart(transaction.franchisee._id, transaction._id).catch((error) => {
                        console.log(error);
                        reject(error);
                      });
                    }
                  }
                  Transaction.delete(transactionData).then(() => {
                    Email.updateEmail(dataClient, transactionData.status).catch((error) => {
                      console.log(error);
                      reject(error);
                    });
                    if (transaction.franchisee) {
                      const dataFranchisee = {
                        name: transaction.franchisee.firstName,
                        email: transaction.franchisee.email
                      };
                      Email.updateEmail(dataFranchisee, transactionData.status).catch((error) => {
                        console.log(error);
                        reject(error);
                      });
                    }
                  }).catch((error) => {
                    console.log(error);
                    reject(error);
                  });
                });
                Group.delete(group._id).catch((error) => {
                  console.log(error);
                  reject(error);
                  reject(error);
                });
                const newGroup = {
                  amount: 0,
                  offer: group.offer._id,
                  price: group.offer.price.high,
                  productId: group.offer.product,
                  delivery: group.offer.delivery,
                  closeDate: cropCloseDate,
                  date: cropDateString
                };
                Group.create(newGroup).then((groupId) => {
                  console.log(`Created new group with id: ${groupId}`);
                  groupData = {};
                  Offer.getByQuerySorted({ product: group.productId, active: true, delivery: 'Safra' }, {}).then((offers) => {
                    groupData.unitPrice = offers[0].price.high;
                    groupData.offer = offers[0]._id;
                    offers.forEach((offerElement) => {
                      Offer.getById(groupData.offer).then((groupOffer) => {
                        const offerGroupPrice = ((groupOffer.price.high * 3) + (groupOffer.price.average * 1)) / 4;
                        const offerPrice = ((offerElement.price.high * 3) + (offerElement.price.average * 1)) / 4;
                        if (offerGroupPrice > offerPrice) {
                          groupData.offer = offerElement._id;
                        }
                        else if (offerGroupPrice === offerPrice) {
                          if (groupOffer.stock < offerElement.stock) {
                            groupData.offer = offerElement._id;
                          }
                        }
                        Group.update(group._id, groupData).catch((error) => {
                          console.log(error);
                          reject(error);
                        });
                      }).catch((error) => {
                        console.log(error);
                        reject(error);
                      });
                    });
                  }).catch((error) => {
                    console.log(error);
                    reject(error);
                  });
                }).catch((error) => {
                  console.log(error);
                  reject(error);
                });
              }).catch((error) => {
                console.log(error);
                reject(error);
              });
            }
          }
          if (smallCrop.getTime() === today.getTime()) {
            if (group.delivery === 'Safrinha') {
              Group.getAllTransactions().then((transactions) => {
                transactions.forEach((transaction) => {
                  const dataClient = {
                    name: transaction.buyer.firstName,
                    email: transaction.buyer.email
                  };
                  const transactionData = {
                    status: 'Cancelado'
                  };
                  if (transaction.status === 'Cotado') {
                    User.removeFromMyCart(transaction.buyer._id, transaction._id).catch((error) => {
                      console.log(error);
                      reject(error);
                    });
                    if (transaction.franchisee) {
                      User.removeFromMyCart(transaction.franchisee._id, transaction._id).catch((error) => {
                        console.log(error);
                        reject(error);
                      });
                    }
                  }
                  Transaction.delete(transactionData).then(() => {
                    Email.updateEmail(dataClient, transactionData.status).catch((error) => {
                      console.log(error);
                      reject(error);
                    });
                    if (transaction.franchisee) {
                      let dataFranchisee = {
                        name: transaction.franchisee.firstName,
                        email: transaction.franchisee.email
                      }
                      Email.updateEmail(dataFranchisee, transactionData.status).catch((error) => {
                        console.log(error);
                        reject(error);
                      });
                    }
                  }).catch((error) => {
                    console.log(error);
                    reject(error);
                  });
                });
                Group.delete(group._id).catch((error) => {
                  console.log(error);+ '/' + (crop.getFullYear() + 1)
                  reject(error);
                });
                const newGroup = {
                  amount: 0,
                  offer: group.offer._id,
                  price: group.offer.price.high,
                  productId: group.offer.product,
                  delivery: group.offer.delivery,
                  closeDate: smallCropCloseDate,
                  date: smallCropDateString
                };
                Group.create(newGroup).then((groupId) => {
                  console.log(`Created new group with id: ${groupId}`);
                  groupData = {};
                  Offer.getByQuerySorted({ product: group.productId, active: true, delivery: 'Safrinha' }, {}).then((offers) => {
                    groupData.unitPrice = offers[0].price.high;
                    groupData.offer = offers[0]._id;
                    offers.forEach((offerElement) => {
                      Offer.getById(groupData.offer).then((groupOffer) => {
                        const offerGroupPrice = ((groupOffer.price.high * 3) + (groupOffer.price.average * 1)) / 4;
                        const offerPrice = ((offerElement.price.high * 3) + (offerElement.price.average * 1)) / 4;
                        if (offerGroupPrice > offerPrice) {
                          groupData.offer = offerElement._id;
                        }
                        else if (offerGroupPrice === offerPrice) {
                          if (groupOffer.stock < offerElement.stock) {
                            groupData.offer = offerElement._id;
                          }
                        }
                        Group.update(group._id, groupData).catch((error) => {
                          console.log(error);
                          reject(error);
                        });
                      }).catch((error) => {
                        console.log(error);
                        reject(error);
                      });
                    });
                  }).catch((error) => {
                    console.log(error);
                    reject(error);
                  });
                }).catch((error) => {
                  console.log(error);
                  reject(error);
                });
              }).catch((error) => {
                console.log(error);
                reject(error);
              });
            }
          }
        });
      }).catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  }
}

module.exports = Delivery;
