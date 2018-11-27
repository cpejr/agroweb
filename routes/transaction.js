const express = require('express');
const Email = require('../models/email');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const Dollar = require('../functions/money');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all transactions
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  Transaction.getAll().then((transactions) => {
    res.render('history', { title: 'Histórico', transactions });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * POST Create - Add new transaction to DB
 */
router.post('/', auth.isAuthenticated, (req, res) => {
  const transactionData = {
    amountBought: req.body.amountBought,
    offer: req.body._id,
  };
  if (req.session.userType === 'Franqueado') {
    transactionData.franchisee = req.session._id;
    transactionData.buyer = req.body.buyer;
  }
  else {
    transactionData.buyer = req.session._id;
  }
  Dollar.getUsdValue().then((dollar) => {
    Offer.getById(transactionData.offer).then((offer) => {
      if (offer.delivery !== '48 horas') {
        transactionData.group = true;
      }
      if (!transactionData.group) {
        if (transactionData.amountBought < offer.breakpoints.average) {
          transactionData.unitPrice = offer.price.high;
          transactionData.priceBought = transactionData.amountBought * transactionData.unitPrice;
        }
        else if (transactionData.amountBought >= offer.breakpoints.average && transactionData.amountBought < offer.breakpoints.low) {
          transactionData.unitPrice = offer.price.average;
          transactionData.priceBought = transactionData.amountBought * transactionData.unitPrice;
        }
        else {
          transactionData.unitPrice = offer.price.low;
          transactionData.priceBought = transactionData.amountBought * transactionData.unitPrice;
        }
        if (offer.usd) {
          transactionData.unitPrice *= dollar;
          transactionData.priceBought *= dollar;
        }
        console.log(transactionData);
        // Create a new transaction
        Transaction.create(transactionData).then((transaction) => {
          const balanceOffer = offer.balance + transactionData.amountBought;
          const offerData = {
            balance: balanceOffer
          };
          // Update the offer
          Offer.update(transactionData.offer, offerData).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          User.addToMyCart(transactionData.buyer, transaction).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          if (transactionData.franchisee) {
            User.addToMyCart(transactionData.franchisee, transaction).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
          }
          res.redirect(`transaction/${transaction}`);
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }
      else if (transactionData.group) {
        Group.getOneByQuery({ offer: offer._id }).then((group) => {
          const balanceGroup = group.amount + transactionData.amountBought;
          if (balanceGroup < group.offer.breakpoints.average) {
            transactionData.unitPrice = group.offer.price.high;
            transactionData.priceBought = transactionData.amountBought * transactionData.unitPrice;
          }
          else if (balanceGroup >= group.offer.breakpoints.average && balanceGroup < group.offer.breakpoints.low) {
            transactionData.unitPrice = group.offer.price.average;
            transactionData.priceBought = transactionData.amountBought * transactionData.unitPrice;
          }
          else {
            transactionData.unitPrice = group.offer.price.low;
            transactionData.priceBought = transactionData.amountBought * transactionData.unitPrice;
          }
          if (group.offer.usd) {
            transactionData.unitPrice *= dollar;
            transactionData.priceBought *= dollar;
          }
          console.log(transactionData);
          Transaction.create(transactionData).then((transaction) => {
            Group.update(group._id, { unitPrice: transactionData.unitPrice, amount: balanceGroup }).then(() => {
              Group.updateAllTransactions(group._id).catch((error) => {
                console.log(error);
                res.redirect('/error');
              });
            }).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            Group.addUser(group._id, transactionData.buyer).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            User.addToMyCart(transactionData.buyer, transaction).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            if (transactionData.franchisee) {
              User.addToMyCart(transactionData.buyer, transaction).catch((error) => {
                console.log(error);
                res.redirect('/error');
              });
            }
            Group.addTransaction(group._id, transaction).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            res.redirect(`transaction/${transaction}`);
          }).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Show - Show details of a transaction
 */
router.get('/:id', (req, res) => {
  const { userType } = req.session;
  Transaction.getById(req.params.id).then((transaction) => {
    if (transaction) {
      var myOffer;
      if(transaction.offer.seller._id == req.session._id){
        myOffer = 1;
      }
      else{
        myOffer = 0;
      }
      res.render('orders/show', { title: `Compra #${transaction._id}`, id: req.params.id, userType, ...transaction, myOffer });
    }
    else {
      console.log('Transaction not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * PUT Update - Update a transaction in the database
 */
router.put('/:id', (req, res) => {
  Transaction.getById(req.params.id).then((transaction) => {
    console.log(transaction);
    let transactionData = {};
    const data = {
      name: transaction.buyer.firstName,
      email: transaction.buyer.email
    };
    if (transaction.status === 'Cotado') {
      transactionData.status = 'Aguardando boleto';
      transactionData.taxStatus = 'Aguardando boleto';
      const offerData = {};
      if (transaction.offer.stock < transaction.amountBought) {
        const error = {
          message: 'Tarde demais, o fornecedor não tem mais estoque para atender seu pedido.'
        };
        res.redirect('/error');
      }
      offerData.stock = transaction.offer.stock - transaction.amountBought;
      offerData.balance = transaction.offer.balance - transaction.amountBought;
      if (transaction.offer.stock === 0) {
        offerData.active = false;
      }
      Offer.update(transaction.offer._id, offerData).then(() => {
        Transaction.update(req.params.id, transactionData).then(() => {
          User.removeFromMyCart(transaction.buyer._id, req.params.id).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          User.addTransaction(transaction.buyer._id, req.params.id).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          if (transaction.franchisee) {
            User.removeFromMyCart(transaction.franchisee._id, req.params.id).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            User.addTransaction(transaction.franchisee._id, req.params.id).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
          }
          Email.buyEmail(transaction).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          User.addTransaction(transaction.offer.seller._id, req.params.id).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          Email.sellEmail(transaction).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          Email.adminNewTransactionEmail(transaction).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
        if (transaction.group) {
          let groupData = {};
          Group.getOneByQuery({ offer: transaction.offer._id }).then((group) => {
            Group.removeUser(group._id, transaction.buyer._id).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            Group.removeTransaction(group._id, transaction._id).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            if (offerData.active === false) {
              Offer.getByQuerySorted({ product: group.productId, active: true, delivery: { $ne: '48 horas' } }, {}).then((offers) => {
                groupData.unitPrice = offers[0].price.high;
                groupData.offer = offers[0]._id;
                Dollar.getUsdValue().then((dollar) => {
                  offers.forEach((offerElement) => {
                    Offer.getById(groupData.offer).then((groupOffer) => {
                      let offerGroupPrice = ((groupOffer.price.high * 3) + (groupOffer.price.average * 1)) / 4;
                      let offerPrice = ((offerElement.price.high * 3) + (offerElement.price.average * 1)) / 4;
                      if (groupOffer.usd) {
                        offerGroupPrice *= dollar;
                      }
                      if (offerElement.usd) {
                        offerPrice *= dollar;
                      }
                      if (offerGroupPrice > offerPrice) {
                        groupData.offer = offerElement._id;
                      }
                      else if (offerGroupPrice === offerPrice) {
                        if (groupOffer.stock < offerElement.stock) {
                          groupData.offer = offerElement._id;
                        }
                      }
                      if (!group.active) {
                        groupData.active = true;
                      }
                      Group.update(group._id, groupData).catch((error) => {
                        console.log(error);
                        res.redirect('/error');
                      });
                    }).catch((error) => {
                      console.log(error);
                      res.redirect('/error');
                    });
                  });
                }).catch((error) => {
                  console.log(error);
                  res.redirect('/error');
                });
              }).catch((error) => {
                console.log(error);
                res.redirect('/error');
              });
            }
          }).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          Group.getOneByQuery({ offer: transaction.offer._id }).then((group) => {
            groupData = {};
            groupData.amount = group.amount - transaction.amountBought;
            if (groupData.amount < group.offer.breakpoints.average) {
              groupData.unitPrice = group.offer.price.high;
            }
            else if (groupData.amount >= group.offer.breakpoints.average && groupData.amount < group.offer.breakpoints.low) {
              groupData.unitPrice = group.offer.price.average;
            }
            else {
              groupData.unitPrice = group.offer.price.low;
            }
            Group.update(group._id, groupData).then(() => {
              Group.updateAllTransactions(group._id).catch((error) => {
                console.log(error);
                res.redirect('/error');
              });
            }).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
          }).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    else {
      transactionData = req.body.transaction;
      Transaction.update(req.params.id, transactionData).then(() => {
        Email.updateEmail(data, transactionData.status).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  req.flash('success', 'Compra realizada.');
  res.redirect(`/user`);
});

/**
 * DELETE Destroy - Removes a transaction from the databse
 */
router.delete('/:id', (req, res) => {
  const userId = req.session._id;
  const offerData = {};
  Transaction.getById(req.params.id).then((transaction) => {
    if (transaction.status === 'Cotado') {
      User.removeFromMyCart(userId, req.params.id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      if (transaction.franchisee) {
        User.removeFromMyCart(transaction.buyer._id, req.params.id).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }
      offerData.balance = transaction.offer.balance - transaction.amountBought;
    }
    else {
      offerData.stock = transaction.offer.stock + transaction.amountBought;
    }
    if (transaction.group) {
      const groupData = {};
      Group.getOneByQuery({ offer: transaction.offer._id }).then((group) => {
        Group.removeUser(group._id, transaction.buyer._id).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
        Group.removeTransaction(group._id, transaction._id).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
        groupData.amount = group.amount - transaction.amountBought;
        if (groupData.amount < group.offer.breakpoints.average) {
          groupData.unitPrice = group.offer.price.high;
        }
        else if (groupData.amount >= group.offer.breakpoints.average && groupData.amount < group.offer.breakpoints.low) {
          groupData.unitPrice = group.offer.price.average;
        }
        else {
          groupData.unitPrice = group.offer.price.low;
        }
        Group.update(group._id, groupData).then(() => {
          Group.updateAllTransactions(group._id).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    Offer.update(transaction.offer._id, offerData).then(() => {
      Transaction.delete(req.params.id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      res.redirect('/transaction');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  req.flash('success', 'Compra cancelada.');
  res.redirect(`transaction/${transaction}`);
});

router.post('/:id/updateTransaction', auth.isAuthenticated, (req, res) => {
  console.log(req.body.status);
  const transaction = {
    status: req.body.status
  };
  Transaction.update(req.params.id, transaction).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  switch(transaction.status) {
  case 'Aguardando aprovação':
      req.flash('success', 'Status da transação atualizado para: Aguardando aprovação.');
      break;
  case 'Aguardando pagamento':
      req.flash('success', 'Status da transação atualizado para: Aguardando pagamento.');
      break;
  case 'Pagamento confirmado':
      req.flash('success', 'Status da transação atualizado para: Pagamento confirmado.');
      break;
  case 'Produto a caminho':
      req.flash('success', 'Status da transação atualizado para: Pagamento confirmado.');
      break;
  case 'Entregue':
      req.flash('success', 'Produto entregue.');
      break;
  case 'Cancelado':
      req.flash('success', 'Transação cancelada');
      break;
  default:
      req.flash('success', 'Status da taxa de transação atualizado.');
    }
  res.redirect('/user/sales');
});

// /**
//  * GET Show - Show details of a product
//  */
// router.get('/:id', (req, res) => {
//   Transaction.getById(req.params.id).then((transaction) => {
//     if (transaction) {
//       console.log(transaction);
//       res.render('/site', { title: transaction.name });
//     }
//     else {
//       console.log('Transaction not found!');
//       res.redirect('/user');
//     }
//   }).catch((error) => {
//     console.log(error);
//     res.redirect('/error');
//   });
// });

module.exports = router;
