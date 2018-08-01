const express = require('express');
const firebase = require('firebase');
const Group = require('../models/group');
const Newsletter = require('../models/newsletter');
const Offer = require('../models/offer');
const Product = require('../models/product');
const User = require('../models/user');
const auth = require('./middleware/auth');

var router = express.Router();

/**
 * GET Test Home page
 */
router.get('/', (req, res) => {
  Newsletter.getAll().then((news) => {
    console.log(news[0]);
    console.log('=================================');
    console.log(news);
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * POST Test Request
 */
router.post('/', (req, res) => {
  console.log('====== body ========');
  console.log(req.body);
});

/**
 * GET Search Results page
 */
router.get('/search', (req, res) => {
  const regex = new RegExp(req.query.filter, 'i');
  const queryProduct = { name: regex };
  const sortProduct = {};
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    for (let product of products) {
      const queryOffer = { product: product._id, delivery: 'em até 48 horas' };
      const sortOffer = { 'price.low': 1 };
      Offer.getByQuerySorted(queryOffer, sortOffer).then((offers) => {
        console.log(offers);
        res.render('results', { title: `Resultados para "${req.query.name}"`, layout: 'layout', offers });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  // const regex = new RegExp(req.body.search, 'i');
  // console.log(regex);
  // const queryGroup = { offer: { product: { name: regex } } };
  // const sortGroup = {};
  // const queryOffer = { product: { name: regex }, delivery: 'em até 48 horas' };
  // const sortOffer = { price: { low: 1 } };
  // Group.getByQuerySorted(queryGroup, sortGroup).then((groups) => {
  //   Offer.getByQuerySorted(queryOffer, sortOffer).then((offers) => {
  //     res.render('results', { title: `Resultados para ${req.body.search}`, layout: 'layout ', groups });
  //   }).catch((error) => {
  //     console.log(error);
  //     res.redirect('/error');
  //   });
  // }).catch((error) => {
  //   console.log(error);
  //   res.redirect('/error');
  // });
});

module.exports = router;
