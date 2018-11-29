const express = require('express');
const firebase = require('firebase');
const Chem = require('../models/chem');
const Dollar = require('../functions/money');
const Email = require('../models/email');
const Group = require('../models/group');
const Newsletter = require('../models/newsletter');
const Offer = require('../models/offer');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');
const fs = require('fs');

const router = express.Router();

router.get('/', (req, res) => {
  // const names = [];
  // const queryProduct = {};
  // const sortProduct = { name: 1 };
  // Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
  //   products.forEach((product) => {
  //     names.push(product.name);
  //   });
  //   console.log(names);
  //   res.locals.names = names;
  //   console.log(res);
  //   // res.send(names);
  // }).catch((error) => {
  //   console.log(error);
  //   res.redirect('/error');
  // });
  Dollar.createDollarJSON().then(() => {
    Dollar.getUsdValue().then((dollar) => {
      console.log(dollar);
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

router.get('/test', (req, res) => {
  const names = [];
  const queryProduct = {};
  const sortProduct = { name: 1 };
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    products.forEach((product) => {
      names.push(product.name);
    });
    console.log(names);
    res.send(names);
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Search Results page
 */
router.get('/search', (req, res) => {
  const regex = new RegExp(req.query.filter, 'i');
  const queryProduct = { name: regex };
  console.log(queryProduct);
  const sortProduct = {};
  const promises = [];
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    products.forEach((product) => {
      const queryOffer = { product: product._id};
      const sortOffer = { 'price.low': 1 };
      console.log('Querry Offer -> ', queryOffer);
      console.log('Sort Offer -> ', sortOffer);
      const promise = Offer.getByQuerySorted(queryOffer, sortOffer);
      promises.push(promise);
    });
    Promise.all(promises).then((offersSearch) => {
      const offers = offersSearch[0];
      console.log(offers);
      res.render('results', { title: `Resultados para "${req.query.name}"`, layout: 'layout', offers });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
    // for (let product of products) {
    //   const queryOffer = { product: product._id, delivery: '48 horas' };
    //   const sortOffer = { 'price.low': 1 };
    //   Offer.getByQuerySorted(queryOffer, sortOffer).then((offers) => {
    //     console.log(offers);
    //     res.render('results', { title: `Resultados para "${req.query.name}"`, layout: 'layout', offers });
    //   }).catch((error) => {
    //     console.log(error);
    //     res.redirect('/error');
    //   });
    // }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
