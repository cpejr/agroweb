const express = require('express');
const Email = require('../models/email');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const Dollar = require('../functions/money');
const Config = require('../functions/config')
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all transactions
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  const { userType } = req.session;
  User.getAllTransactionsByUserId(req.session._id).then((transactions) => {
    res.render('history', { title: 'Histórico', transactions, userType });
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
        // Create a new transaction
        Transaction.create(transactionData).then((transaction) => {
          const balanceOffer = parseInt(offer.balance) + parseInt(transactionData.amountBought);
          const offerData = {
            balance: balanceOffer
          };
          // Update the offer
          Offer.update(transactionData.offer, offerData).catch((error) => {
            req.flash('danger', 'Não foi possível atualizar a transação.');
            res.redirect('/user');
          });
          User.addToMyCart(transactionData.buyer, transaction).catch((error) => {
            req.flash('danger', 'Não foi possível adicionar no carrinho do comprador.');
            res.redirect('/error');
          });
          if (transactionData.franchisee) {
            User.addToMyCart(transactionData.franchisee, transaction).catch((error) => {
              req.flash('danger', 'Não foi possível adicionar no carrinho do franqueado.');
              res.redirect('/user');
            });
          }
          res.redirect(`transaction/${transaction}`);
        }).catch((error) => {
          req.flash('danger', 'Não foi possível cotar este produto.');
          res.redirect('/user');
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
          Transaction.create(transactionData).then((transaction) => {
            Group.update(group._id, { unitPrice: transactionData.unitPrice, amount: balanceGroup }).then(() => {
              Group.updateAllTransactions(group._id).catch((error) => {
                req.flash('danger', 'Não foi possível atualizar todas as transações do grupo.');
                res.redirect('/user');
              });
            }).catch((error) => {
              req.flash('danger', 'Não foi possível atualizar o grupo.');
              res.redirect('/user');
            });
            Group.addUser(group._id, transactionData.buyer).catch((error) => {
              req.flash('danger', 'Não foi possível adicionar o usuário no grupo.');
              res.redirect('/user');
            });
            User.addToMyCart(transactionData.buyer, transaction).catch((error) => {
              req.flash('danger', 'Não foi possível adicionar a transação no carrinho do comprador.');
              res.redirect('/user');
            });
            if (transactionData.franchisee) {
              User.addToMyCart(transactionData.buyer, transaction).catch((error) => {
                req.flash('danger', 'Não foi possível adicionar a transação no carrinho do franqueado.');
                res.redirect('/user');
              });
            }
            Group.addTransaction(group._id, transaction).catch((error) => {
              req.flash('danger', 'Não foi possível adicionar a transação no grupo.');
              res.redirect('/user');
            });
            res.redirect(`transaction/${transaction}`);
          }).catch((error) => {
            req.flash('danger', 'Não foi possível criar a transação.');
            res.redirect('/user');
          });
        }).catch((error) => {
          req.flash('danger', 'Não foi possível encontrar a oferta no grupo.');
          res.redirect('/user');
        });
      }
    }).catch((error) => {
      req.flash('danger', 'Há algum erro nesta oferta.');
      res.redirect('/user');
    });
  }).catch((error) => {
    req.flash('danger', 'Não foi possível obter o valor do dólar. Aguarde um momento.');
    res.redirect('/user');
  });
});

/**
 * GET Show - Show details of a transaction
 */
router.get('/:id', (req, res) => {
  const { userType } = req.session;
  Transaction.getById(req.params.id).then((transaction) => {
    if (transaction) {
      let myOffer;
      if (transaction.offer.seller._id === req.session._id) {
        myOffer = 1;
      }
      else {
        myOffer = 0;
      }
      res.render('orders/show', { title: `Compra #${transaction._id}`, id: req.params.id, userType, ...transaction, myOffer });
    }
    else {
      req.flash('danger', 'Não foi possível a transação.');
      res.redirect('/user');
    }
  }).catch((error) => {
    req.flash('danger', 'Não foi possível a transação.');
    res.redirect('/user');
  });
});

/**
 * PUT Update - Update a transaction in the database
 */
router.put('/:id', (req, res) => {
  Config.getConfigValue().then((config) => {
    Transaction.getById(req.params.id).then((transaction) => {
      let transactionData = {};
      const data = {
        name: transaction.buyer.firstName,
        email: transaction.buyer.email
      };
      if (transaction.status === 'Cotado') {
        transactionData.status = 'Aguardando boleto';
        if (transaction.franchisee) {
          let tax = 0;

          if (transaction.offer.product.category === 'Fertilizantes sólidos') {
            tax = config.solidFertilizerTax;
          }
          else if (transaction.offer.product.category === 'Defensivos agrícolas/agrotóxicos') {
            tax = config.defensiveTax;
          }
          else if (transaction.offer.product.category === 'Sementes') {
            tax = config.seedTax;
          }
          else if (transaction.offer.product.category === 'Fertilizantes líquidos/adjuvantes/biológicos') {
            tax = config.liquidFertilizerTax;
          }

          transactionData.taxStatus = 'Aguardando boleto';
          transactionData.franchiseeTaxStatus = 'Não necessário';
          transactionData.franchiseeTaxValue = transaction.priceBought * tax;
        }
        const offerData = {};
        if (transaction.offer.stock < transaction.amountBought) {
          req.flash('danger', 'Tarde demais, o fornecedor não tem mais estoque para atender seu pedido.');
          res.redirect('/user');
        }
        offerData.stock = transaction.offer.stock - transaction.amountBought;
        offerData.balance = transaction.offer.balance - transaction.amountBought;
        if (transaction.offer.stock === 0) {
          offerData.active = false;
        }
        Offer.update(transaction.offer._id, offerData).then(() => {
          Transaction.update(req.params.id, transactionData).then(() => {
            User.removeFromMyCart(transaction.buyer._id, req.params.id).catch((error) => {
              req.flash('danger', 'Não foi possível remover do carrinho do comprador.');
              res.redirect('/user');
            });
            User.addTransaction(transaction.buyer._id, req.params.id).catch((error) => {
              req.flash('danger', 'Não foi possível adicionar a compra para o comprador.');
              res.redirect('/user');
            });
            if (transaction.franchisee) {
              User.removeFromMyCart(transaction.franchisee._id, req.params.id).catch((error) => {
                req.flash('danger', 'Não foi possível remover do carrinho do franqueado.');
                res.redirect('/user');
              });
              User.addTransaction(transaction.franchisee._id, req.params.id).catch((error) => {
                req.flash('danger', 'Não foi possível adicionar a compra para o franqueado.');
                res.redirect('/user');
              });
            }
            Email.buyEmail(transaction).catch((error) => {
              req.flash('danger', 'Não foi possível enviar email de compra.');
              res.redirect('/user');
            });
            User.addTransaction(transaction.offer.seller._id, req.params.id).catch((error) => {
              req.flash('danger', 'Não foi possível adicionar a compra para o vendedor.');
              res.redirect('/user');
            });
            Email.sellEmail(transaction).catch((error) => {
              console.log(error);
              req.flash('danger', 'Não foi possível enviar email de venda.');
              res.redirect('/user');
            });
            if (transaction.franchisee) {
              const Trans = transaction;
              User.getById(transaction.franchisee).then((franchi) => {
                Trans.franchisee = franchi;
                console.log(Trans.franchisee);
                Email.FranchiseeEmail(Trans).catch((error) => {
                  console.log(error);
                  req.flash('danger', 'Não foi possível enviar email do Franqueado.');
                  res.redirect('/user');
                });
              });
            }
            Email.adminNewTransactionEmail(transaction).catch((error) => {
              console.log(error);
              req.flash('danger', 'Não foi possível enviar email para o administrador.');
              res.redirect('/user');
            });
            req.flash('success', 'Compra realizada.');
            res.redirect('/user/orders');
          }).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível atualizar a transação.');
            res.redirect('/user');
          });
          if (transaction.group) {
            let groupData = {};
            Group.getOneByQuery({ offer: transaction.offer._id }).then((group) => {
              Group.removeUser(group._id, transaction.buyer._id).catch((error) => {
                console.log(error);
                req.flash('danger', 'Não foi possível remover usuário do grupo.');
                res.redirect('/user');
              });
              Group.removeTransaction(group._id, transaction._id).catch((error) => {
                console.log(error);
                req.flash('danger', 'Não foi possível remover transação do grupo.');
                res.redirect('/user');
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
                          req.flash('danger', 'Não foi possível atualizar o grupo.');
                          res.redirect('/user');
                        });
                      }).catch((error) => {
                        console.log(error);
                        req.flash('danger', 'Não foi possível encontrar a oferta.');
                        res.redirect('/user');
                      });
                    });
                  }).catch((error) => {
                    console.log(error);
                    req.flash('danger', 'Não foi possível encontrar o valor do dólar.');
                    res.redirect('/user');
                  });
                }).catch((error) => {
                  console.log(error);
                  req.flash('danger', 'Não foi possível encontrar a oferta.');
                  res.redirect('/user');
                });
              }
            }).catch((error) => {
              console.log(error);
              req.flash('danger', 'Não foi possível encontrar o grupo de compras.');
              res.redirect('/user');
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
                  req.flash('danger', 'Não foi possível atualizar as transações do grupo.');
                  res.redirect('/user');
                });
              }).catch((error) => {
                console.log(error);
                req.flash('danger', 'Não foi possível atualizar o grupo.');
                res.redirect('/user');
              });
            }).catch((error) => {
              console.log(error);
              req.flash('danger', 'Não foi possível encontrar o grupo.');
              res.redirect('/user');
            });
          }
        }).catch((error) => {
          console.log(error);
          req.flash('danger', 'Não foi possível atualizar o grupo.');
          res.redirect('/user');
        });
      }
      else {
        transactionData = req.body.transaction;
        Transaction.update(req.params.id, transactionData).then(() => {
          Email.updateEmail(data, transactionData.status).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível atualizar o email.');
            res.redirect('/user');
          });
          req.flash('success', 'Compra realizada.');
          res.redirect('/user/orders');
        }).catch((error) => {
          console.log(error);
          req.flash('danger', 'Não foi possível atualizar o transação.');
          res.redirect('/user');
        });
      }
    }).catch((error) => {
      console.log(error);
      req.flash('danger', 'Não foi possível encontrar essa transação.');
      res.redirect('/user');
    });
  }).catch((error) => {
    console.log(error);
    req.flash('danger', 'Não foi possível pegar o valor da taxa sobre essa categoria de produto.');
    res.redirect('/user');
  });
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
        req.flash('danger', 'Não foi possível remover cotação do carrinho.');
        res.redirect('/user');
      });
      if (transaction.franchisee) {
        User.removeFromMyCart(transaction.buyer._id, req.params.id).catch((error) => {
          req.flash('danger', 'Não foi possível remover cotação do comprador.');
          res.redirect('/user');
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
          req.flash('danger', 'Não foi possível remover usuário do grupo.');
          res.redirect('/user');
        });
        Group.removeTransaction(group._id, transaction._id).catch((error) => {
          req.flash('danger', 'Não foi possível remover cotação do grupo.');
          res.redirect('/user');
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
            req.flash('danger', 'Não foi possível atualizar todas transações do grupo.');
            res.redirect('/user');
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
      Transaction.delete(req.params.id).then(() => {
        req.flash('success', 'Compra cancelada.');
        res.redirect(`/transaction/${req.params.id}`);
      }).catch((error) => {
        console.log(error);
        req.flash('danger', 'Não foi possível deletar transação.');
        res.redirect('/user');
      });
    }).catch((error) => {
      console.log(error);
      req.flash('danger', 'Não foi possível atualizar oferta.');
      res.redirect('/user');
    });
  }).catch((error) => {
    console.log(error);
    req.flash('danger', 'Não foi possível encontrar transação.');
    res.redirect('/user');
  });
});

router.post('/:id/updateTransaction', auth.isAuthenticated, (req, res) => {
  Transaction.getById(req.params.id).then((transaction) => {
    transaction.status = req.body.status;

    if (transaction.franchisee) {
      User.getById(transaction.franchisee).then((user) => {
        if( transaction.status == 'Entregue' ) {
          user.pendingPayment += transaction.franchiseeTaxValue;
          transaction.franchiseeTaxStatus = 'Pendente';
          User.update(user._id, user).catch((error) => {
            req.flash('danger', 'Não foi possível atualizar o usuário.');
            res.redirect('/user');
          });
          Transaction.update(transaction._id, transaction).then(() => {
            res.redirect('/user/sales');
          }).catch((error) => {
            req.flash('danger', 'Não foi possível atualizaçar transação.');
            res.redirect('/user');
          });
        }
      }).catch((error) => {
        req.flash('danger', 'Não foi possível encontrar o usuário.');
        res.redirect('/user');
      });
    }

    Transaction.update(req.params.id, transaction).then(() => {
      res.redirect('/user/sales');
    }).catch((error) => {
      req.flash('danger', 'Não foi possível atualizaçar transação.');
      res.redirect('/user');
    });
    switch (transaction.status) {
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
  });
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
