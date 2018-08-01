const express = require('express');
const firebase = require('firebase');
const Newsletter = require('../models/newsletter');
const Product = require('../models/product');
const Offer = require('../models/offer');
const User = require('../models/user');
const auth = require('./middleware/auth');

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
    console.log(offers);
    res.render('admin/offers', { title: 'Ofertas', layout: 'layout', offers });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
