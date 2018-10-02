var express = require('express');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Product = require('../models/product');

var router = express.Router();

/**
 * GET Offers Results page
 */
router.get('/', (req, res) => {
  const regex = new RegExp(req.query.filter, 'i');
  const queryProduct = { name: regex };
  const sortProduct = {};
  const offerPromises = [];
  const groupPromises = [];
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    products.forEach((product) => {
      const queryOffer = { product: product._id, delivery: 'em até 48 horas' };
      const sortOffer = { 'price.low': 1 };
      const queryGroup = { productId: product._id };
      const sortGroup = {};
      let promise = Offer.getByQuerySorted(queryOffer, sortOffer);
      offerPromises.push(promise);
      promise = Group.getByQuerySorted(queryGroup, sortGroup);
      groupPromises.push(promise);
    });
    Promise.all(offerPromises).then((offerResults) => {
      console.log(offerResults);
      Promise.all(groupPromises).then((groupResults) => {
        console.log(groupResults);
        const groups = groupResults[0].concat(groupResults[1]);
        const offers = offerResults[0].concat(offerResults[1]);
        console.log(offers);
        console.log(groups);
        res.render('results', { title: `Resultados para "${req.query.filter}"`, layout: 'layout', groups, offers });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
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
 * GET Products Results page
 */
router.get('/products', (req, res) => {
  console.log(req.query.filter);
  const regex = new RegExp(req.query.filter, 'i');
  const queryProduct = { name: regex };
  const sortProduct = { name: 1 };
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    console.log(products);
    res.render('resultsProducts', { title: `Resultados para "${req.query.name}"`, layout: 'layoutHome', products });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
