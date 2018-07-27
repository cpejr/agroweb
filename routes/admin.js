const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const Newsletter = require('../models/newsletter.js');
const Product = require('../models/product.js');
const auth = require('./middleware/auth');
const Offer = require('../models/offer.js');
const Transaction = require('../models/transaction.js');

const router = express.Router();

/* GET Admin Home page */
router.get('/', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  res.render('admin/index', { title: 'Administrador', layout: 'layout' });
});

/* GET Users - Show all users */
router.get('/users', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getAll().then((users) => {
    res.render('admin/users', { title: 'Usuários', layout: 'layout', users });
  }).catch((err) => {
    console.log(err);
  });
});

/* GET Products - Show all products docs */
router.get('/products', (req, res) => {
  Product.getAll().then((products) => {
    console.log(products);
    res.render('admin/products', { title: 'Produtos', products });
  }).catch((err) => {
    console.log(err);
    res.redirect('/error');
  });
});

/* GET Newsletter - Show all newsletter docs */
router.get('/newsletter', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Newsletter.getAll().then((newsletter) => {
    console.log(newsletter);
    res.render('admin/newsletter', { title: 'Usuários', layout: 'layout', newsletter });
  }).catch((err) => {
    console.log(err);
  });
});

/* GET Offers - Show all offers */
router.get('/offers', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Offer.getAll().then((offers) => {
    res.render('admin/offer', { title: 'Administrador', layout: 'layout', offers });
  }).catch((err) => {
    console.log(err);
  });
});

/* GET Tickets - Show all pending tickets */
router.get('/transaction', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Transaction.getAllByStatus('Boleto pendente').then((transactions) => {
    res.render('admin/transaction', { title: 'Administrador', layout: 'layout', transactions });
  }).catch((err) => {
    console.log(err);
  });
});

module.exports = router;
