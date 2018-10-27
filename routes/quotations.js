const express = require('express');
const firebase = require('firebase');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');

var router = express.Router();

/**
 * GET Index - Show all quotations
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  const userId = req.session._id;
  User.getAllQuotationsByUserId(userId).then((quotations) => {
    console.log(`Cotações: ${quotations}`);
    res.render('quotations/index', { title: 'Cotações', layout: 'layout', quotations });
  });
});

// /**
//  * GET Show - Show details of a quotation
//  */
// router.get('/:id', auth.isAuthenticated, (req, res) => {
//   Transaction.getById(req.params.id).then((transaction) => {
//     if (transaction) {
//       console.log(transaction);
//       res.render('products/show', { title: , id: req.params.id, ...transaction });
//     }
//     else {
//       console.log('Product not found!');
//       res.redirect('/user');
//     }
//   }).catch((error) => {
//   console.log(error);
//   res.redirect('/error');
// });
// });


module.exports = router;
