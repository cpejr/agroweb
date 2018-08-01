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
    res.render('quotations/index', { title: 'Transações', transactions });
  }).catch((err) => {
    console.log(err);
  });
});

/**
 * POST Create - Add new transaction to DB
 */
router.post('/', auth.isAuthenticated, (req, res) => {
  res.render('/success', { title: 'Sua transação foi efetuada com sucesso!' });
  const buyer = req.session._id;
  const { amountBought } = req.body;

  const transactionData = {
    buyer,
    priceBought: req.body.priceBought,
    amountBought,
    unitPrice: req.body.unitPrice,
    offer: null
  };

  console.log(transactionData);
  // Create a new transaction
  Transaction.create(transactionData).then((transaction) => {
    Group.getById(groupId).then((group) => {
      const amountGroup = group.amount - amountBought;
      const groupData = {
        amount: amountGroup
      };
      Group.update(groupId, groupData); // update the group
      Group.deleteUser(groupId, buyer); // delete a user
    });

    Offer.getById(offerId).then((offer) => {
      const stockOffer = offer.stock - amountBought;
      const offerData = {
        stock: stockOffer
      };
      Offer.update(offerId, offerData); // update the offer
      User.addTransaction(offer.seller, transaction);
    });
    User.addTransaction(buyer, transaction);
  }).catch((error) => {
    console.log(error);
    res.redirect('/transaction');
  });
});

/**
 * GET Show - Show details of a transaction
 */
router.get('/:id', (req, res) => {
  Transaction.getById(req.params.id).then((transaction) => {
    if (transaction) {
      console.log(transaction);
      res.render('quotations/show', { title: transaction.offer.product.name, id: req.params.id, ...transaction });
    }
    else {
      console.log('Transaction not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
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
  Transaction.update(req.params.id, transaction).then(() => {
    Email.updateEmail(data, transaction.status).then((info) => {
      console.log(info);
    }).catch(err => console.log(err));
  }).catch((err) => {
    console.log(err);
  });
  res.redirect(`/transaction/${req.params.id}`);
});

/**
 * DELETE Destroy - Removes a transaction from the databse
 */
router.delete('/:id', (req, res) => {
  Transaction.delete(req.params.id).catch((err) => {
    console.log(err);
  });
  res.redirect('/transaction');
});

module.exports = router;
