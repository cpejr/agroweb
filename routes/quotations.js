const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const auth = require('./middleware/auth');
const Product = require('../models/product.js');


var router = express.Router();

/* GET users listing. */
router.get('/', auth.isAuthenticated, (req, res) => {
  const userId = req.session._id;
  User.getAllTransactionsByUserId(userId).then((quotations) => {
    console.log(`Cotações: ${quotations}`);
    res.render('quotations/index', { title: 'Cotações', layout: 'layout', quotations});
  });
});

router.get('/results', auth.isAuthenticated, (req, res) => {
  Product.getById(productId).then((product) => {
    res.render('quotations/show', { title: 'Cotações', layout: 'layout', product});
  });
});


module.exports = router;
