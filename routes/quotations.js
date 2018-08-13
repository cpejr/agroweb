const express = require('express');
const firebase = require('firebase');
const Product = require('../models/product');
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

/**
 * GET Results - Show details of a quotation
 */
router.get('/results', auth.isAuthenticated, (req, res) => {
  Product.getById(productId).then((product) => {
    res.render('quotations/show', { title: 'Cotações', layout: 'layout', product });
  });
});


module.exports = router;
