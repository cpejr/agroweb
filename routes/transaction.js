const express = require('express');
const Email = require('../models/email');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all transactions
 */
router.get('/', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Transaction.getAll().then((transactions) => {
    console.log(transactions);
    res.render('orders/index', { title: 'Transações', transactions });
  }).catch((error) => {
    console.log(error);
    res.redirect('/transaction');
  });
});

/**
 * POST Create - Add new transaction to DB
 */
router.post('/', auth.isAuthenticated, (req, res) => {
  const transaction = {
    buyer: req.session._id,
    amountBought: req.body.amountBought,
    offer: req.body._id
  };
  Offer.getById(transaction.offer).then((offer) => {
    if (transaction.amountBought < offer.breakpoints.average) {
      transaction.unitPrice = offer.price.high;
      transaction.priceBought = transaction.amountBought * transaction.unitPrice;
    }
    else if (transaction.amountBought >= offer.breakpoints.average && transaction.amountBought < offer.breakpoints.low) {
      transaction.unitPrice = offer.price.average;
      transaction.priceBought = transaction.amountBought * transaction.unitPrice;
    }
    else {
      transaction.unitPrice = offer.price.low;
      transaction.priceBought = transaction.amountBought * transaction.unitPrice;
    }
    console.log(transaction);
    // Create a new transaction
    Transaction.create(transaction).then((transactionID) => {
      // Group.getById(groupId).then((group) => {
      //   const amountGroup = group.amount - amountBought;
      //   const groupData = {
      //     amount: amountGroup
      //   };
      //   Group.update(groupId, groupData); // update the group
      //   Group.deleteUser(groupId, buyer); // delete a user
      // });

      const balanceOffer = offer.balance - transaction.amountBought;
      console.log(balanceOffer);
      const offerData = {
        balance: balanceOffer
      };
      // Update the offer
      Offer.update(transaction.offer, offerData).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      User.addToMyCart(transaction.buyer, transactionID).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      res.redirect(`transaction/${transactionID}`);
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
      console.log(transaction);
      if (transaction.status === 'Cotado') {
        res.render('quotations/show', { title: `Compra #${transaction._id}`, id: req.params.id, userType, ...transaction });
      }
      else {
        res.render('orders/show', { title: `Compra #${transaction._id}`, id: req.params.id, userType, ...transaction });
      }
    }
    else {
      console.log('Transaction not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/transaction');
  });
});

/**
 * PUT Update - Update a transaction in the database
 */
router.put('/:id', (req, res) => {
  const { transaction } = req.body;
  const data = {
    name: req.session.firstName,
    email: req.session.email
  };
  if (transaction.status === 'Aguardando boleto') {
    transaction.taxStatus = 'Aguardando Boleto';
  }
  Transaction.update(req.params.id, transaction).then(() => {
    Email.updateEmail(data, transaction.status).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
    if (transaction.status === 'Aguardando boleto') {
      Offer.findById(transaction.offer).then((offer) => {
        offer.stock -= transaction.amountBought;
        Offer.update(transaction.offer, offer).catch((error) => {
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
    res.redirect('/transaction');
  });
  res.redirect(`/transaction/${req.params.id}`);
});

/**
 * DELETE Destroy - Removes a transaction from the databse
 */
router.delete('/:id', (req, res) => {
  const userId = req.session._id;
  Transaction.delete(req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  User.removeFromMyCart(userId, req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  User.removeTransaction(userId, req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/transaction');
});

module.exports = router;
