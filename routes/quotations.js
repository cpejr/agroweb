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
    res.render('quotations/index', { title: 'Cotações', layout: 'layout', quotations, ...req.session });
  });
});


module.exports = router;
