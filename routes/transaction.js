const express = require('express');
const Email = require('../models/email');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');
const commercial = require('./middleware/commercial');

const router = express.Router();

/**
 * GET Index - Show all transactions
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  User.getAllTransactionsByUserId(req.session.userId).then((transactions) => {
    res.render('history', { title: 'Histórico', transactions, ...req.session });
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
    amountBought: parseFloat(req.body.amountBought),
    offer: req.body._id,
  };
  if (req.session.userType === 'Franqueado') {
    transactionData.franchisee = req.session.userId;
    transactionData.buyer = req.body.buyer;
  }
  else {
    transactionData.buyer = req.session.userId;
  }
  Offer.getById(transactionData.offer).then((offer) => {
    if (offer.delivery !== '48 horas' && !offer.megaOpportunity) {
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
      transactionData.unitPrice = parseFloat(transactionData.unitPrice.toFixed(2));
      transactionData.priceBought = parseFloat(transactionData.priceBought.toFixed(2));
      // Create a new transaction
      Transaction.create(transactionData).then((transaction) => {
        const balanceOffer = offer.balance + transactionData.amountBought;
        const offerData = {
          balance: balanceOffer
        };
        // Update the offer
        Offer.update(transactionData.offer, offerData).catch((error) => {
          console.log(error);
          req.flash('danger', 'Não foi possível atualizar a oferta.');
          res.redirect('/user');
        });
        User.addToMyCart(transactionData.buyer, transaction).catch((error) => {
          console.log(error);
          req.flash('danger', 'Não foi possível adicionar no carrinho do comprador.');
          res.redirect('/error');
        });
        if (transactionData.franchisee) {
          User.addToMyCart(transactionData.franchisee, transaction).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível adicionar no carrinho do franqueado.');
            res.redirect('/user');
          });
        }
        res.redirect(`transaction/${transaction}`);
      }).catch((error) => {
        console.log(error);
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
        transactionData.unitPrice = parseFloat(transactionData.unitPrice.toFixed(2));
        transactionData.priceBought = parseFloat(transactionData.priceBought.toFixed(2));
        transactionData.groupObject = group._id;
        Transaction.create(transactionData).then((transaction) => {
          Group.update(group._id, { unitPrice: transactionData.unitPrice, amount: balanceGroup }).then(() => {
            Group.updateAllTransactions(group._id).catch((error) => {
              console.log(error);
              req.flash('danger', 'Não foi possível atualizar todas as transações do grupo.');
              res.redirect('/user');
            });
          }).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível atualizar o grupo.');
            res.redirect('/user');
          });
          Group.addUser(group._id, transactionData.buyer).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível adicionar o usuário no grupo.');
            res.redirect('/user');
          });
          User.addToMyCart(transactionData.buyer, transaction).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível adicionar a transação no carrinho do comprador.');
            res.redirect('/user');
          });
          if (transactionData.franchisee) {
            User.addToMyCart(transactionData.franchisee, transaction).catch((error) => {
              console.log(error);
              req.flash('danger', 'Não foi possível adicionar a transação no carrinho do franqueado.');
              res.redirect('/user');
            });
          }
          Group.addTransaction(group._id, transaction).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível adicionar a transação no grupo.');
            res.redirect('/user');
          });
          res.redirect(`transaction/${transaction}`);
        }).catch((error) => {
          console.log(error);
          req.flash('danger', 'Não foi possível criar a transação.');
          res.redirect('/user');
        });
      }).catch((error) => {
        console.log(error);
        req.flash('danger', 'Não foi possível encontrar a oferta no grupo.');
        res.redirect('/user');
      });
    }
  }).catch((error) => {
    console.log(error);
    req.flash('danger', 'Há algum erro nesta oferta.');
    res.redirect('/user');
  });
});

/**
 * GET Show - Show details of a transaction
 */
router.get('/:id', auth.isAuthenticated, (req, res) => {
  Transaction.getById(req.params.id).then((transaction) => {
    if (transaction) {
      Group.getOneByQuery({ offer: transaction.offer }).then((group) => {
        if (group) {
          res.render('orders/show', { title: `Compra #${transaction._id}`, id: req.params.id, ...transaction, group, ...req.session });
        }
        else {
          res.render('orders/show', { title: `Compra #${transaction._id}`, id: req.params.id, ...transaction, ...req.session });
        }
      }).catch((error) => {
        console.log(error);
        req.flash('danger', 'Não foi possível recuperar a transação.');
        res.redirect('/user');
      });
    }
    else {
      req.flash('danger', 'Não foi possível recuperar a transação.');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    req.flash('danger', 'Não foi possível recuperar a transação.');
    res.redirect('/user');
  });
});

/**
 * PUT Update - Update a transaction in the database
 */
router.put('/:id', auth.isAuthenticated, commercial.hasStock, (req, res) => {
  Transaction.getById(req.params.id).then((transaction) => {
    let transactionData = {};
    const data = {
      name: transaction.buyer.firstName,
      email: transaction.buyer.email,
      transactionID: req.params.id
    };
    if (transaction.status === 'Cotado') {
      transactionData.status = 'Aguardando boleto';
      if (transaction.franchisee) {
        let taxFranchisee = 0;
        if (transaction.offer.product.category === 'Fertilizantes sólidos') {
          taxFranchisee = parseFloat(global.config.tax.franchisee.solidFertilizer);
        }
        else if (transaction.offer.product.category === 'Defensivos agrícolas/agrotóxicos') {
          taxFranchisee = parseFloat(global.config.tax.franchisee.defensive);
        }
        else if (transaction.offer.product.category === 'Sementes') {
          taxFranchisee = parseFloat(global.config.tax.franchisee.seed);
        }
        else if (transaction.offer.product.category === 'Fertilizantes líquidos/adjuvantes/biológicos') {
          taxFranchisee = parseFloat(global.config.tax.franchisee.solidFertilizer);
        }
        transactionData.franchiseeTaxStatus = 'Não necessário';
        transactionData.franchiseeTaxValue = transaction.priceBought * taxFranchisee;
      }
      let taxMegapool = 0;
      if (transaction.offer.megaOpportunity) {
        taxMegapool = parseFloat(global.config.tax.megapool.megaOportunidade);
      }
      else if (transaction.offer.product.category === 'Fertilizantes sólidos') {
        taxMegapool = parseFloat(global.config.tax.megapool.solidFertilizer);
      }
      else if (transaction.offer.product.category === 'Defensivos agrícolas/agrotóxicos') {
        taxMegapool = parseFloat(global.config.tax.megapool.defensive);
      }
      else if (transaction.offer.product.category === 'Sementes') {
        taxMegapool = parseFloat(global.config.tax.megapool.seed);
      }
      else if (transaction.offer.product.category === 'Fertilizantes líquidos/adjuvantes/biológicos') {
        taxMegapool = parseFloat(global.config.tax.megapool.solidFertilizer);
      }
      transactionData.taxValue = transaction.priceBought * taxMegapool;
      const offerData = {};
      offerData.stock = transaction.offer.stock - transaction.amountBought;
      offerData.balance = transaction.offer.balance - transaction.amountBought;
      if (offerData.stock < transaction.offer.minAmount) {
        offerData.active = false;
      }
      Offer.update(transaction.offer._id, offerData).then(() => {
        Transaction.update(req.params.id, transactionData).then(() => {
          User.removeFromMyCart(transaction.buyer._id, req.params.id).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível remover do carrinho do comprador.');
            res.redirect('/user');
          });
          User.addTransaction(transaction.buyer._id, req.params.id).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível adicionar a compra para o comprador.');
            res.redirect('/user');
          });
          if (transaction.franchisee) {
            User.removeFromMyCart(transaction.franchisee._id, req.params.id).catch((error) => {
              console.log(error);
              req.flash('danger', 'Não foi possível remover do carrinho do franqueado.');
              res.redirect('/user');
            });
            User.addTransaction(transaction.franchisee._id, req.params.id).catch((error) => {
              console.log(error);
              req.flash('danger', 'Não foi possível adicionar a compra para o franqueado.');
              res.redirect('/user');
            });
          }
          User.addTransaction(transaction.offer.seller._id, req.params.id).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível adicionar a compra para o vendedor.');
            res.redirect('/user');
          });
          if (transaction.franchisee) {
            const Trans = transaction;
            User.getById(transaction.franchisee).then((franchi) => {
              Trans.franchisee = franchi;
              Email.franchiseeEmail(Trans).catch((error) => {
                console.log(error);
                req.flash('danger', 'Não foi possível enviar email do Franqueado.');
                res.redirect('/user');
              });
            });
          }
          Email.buyEmail(transaction).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível enviar email de compra.');
            res.redirect('/user');
          });
          Email.sellEmail(transaction).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível enviar email de venda.');
            res.redirect('/user');
          });
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
              Offer.getByQuerySorted({ product: group.productId, active: true, delivery: transaction.offer.delivery }, {}).then((offers) => {
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
      if (req.session.userType === 'Indústria' || req.session.userType === 'Revendedor') {
        if (transaction.franchisee) {
          User.getById(transaction.franchisee).then((user) => {
            if (transactionData.status === 'Entregue') {
              const userData = {
                pendingPayment: user.pendingPayment
              };
              userData.pendingPayment = userData.pendingPayment + transaction.franchiseeTaxValue;
              transactionData.franchiseeTaxStatus = 'Pendente';
              User.update(user._id, userData).catch((error) => {
                console.log(error);
                req.flash('danger', 'Não foi possível atualizar o usuário.');
                res.redirect('/user');
              });
            }
          }).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível encontrar o usuário.');
            res.redirect('/user');
          });
        }

        Email.updateEmail(transaction).catch((error) => {
          console.log(error);
          req.flash('danger', 'Não foi possível enviar email de compra.');
          res.redirect('/user');
        });

        Transaction.update(req.params.id, transactionData).then(() => {
          res.redirect('/user/sales');
        }).catch((error) => {
          console.log(error);
          req.flash('danger', 'Não foi possível atualizaçar transação.');
          res.redirect('/user');
        });
        switch (transactionData.status) {
          case 'Aguardando aprovação':
            req.flash('success', 'Status da transação atualizado.');
            break;
          case 'Aguardando pagamento':
            req.flash('success', 'Status da transação atualizado.');
            break;
          case 'Pagamento confirmado':
            req.flash('success', 'Status da transação atualizado.');
            break;
          case 'Produto a caminho':
            req.flash('success', 'Status da transação atualizado.');
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
      }
      else {
        Transaction.update(req.params.id, transactionData).then(() => {
          Email.updateEmail(data).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possível enviar o email.');
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
    }
  }).catch((error) => {
    console.log(error);
    req.flash('danger', 'Não foi possível encontrar essa transação.');
    res.redirect('/user');
  });
});

/**
 * DELETE Destroy - Removes a transaction from the databse
 */
router.delete('/:id',  auth.isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const offerData = {};
  Transaction.getById(req.params.id).then((transaction) => {
    if (transaction.status === 'Cotado') {
      User.removeFromMyCart(userId, req.params.id).catch((error) => {
        console.log(error);
        req.flash('danger', 'Não foi possível remover cotação do carrinho.');
        res.redirect('/user');
      });
      if (transaction.franchisee) {
        User.removeFromMyCart(transaction.buyer._id, req.params.id).catch((error) => {
          console.log(error);
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
          console.log(error);
          req.flash('danger', 'Não foi possível remover usuário do grupo.');
          res.redirect('/user');
        });
        Group.removeTransaction(group._id, transaction._id).catch((error) => {
          console.log(error);
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
            console.log(error);
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
        req.flash('success', 'Transação cancelada.');
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

module.exports = router;
