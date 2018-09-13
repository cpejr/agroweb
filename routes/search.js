var express = require('express');
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
  const promises = [];
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    products.forEach((product) => {
      const queryOffer = { product: product._id};
      const sortOffer = { 'price.low': 1 };
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
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Products Results page
 */
router.get('/products', (req, res) => {
  const regex = new RegExp(req.query.filter, 'i');
  const queryProduct = { name: regex };
  const sortProduct = { name: 1 };
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    console.log(products);
    res.render('resultsProducts', { title: `Resultados para "${req.query.name}"`, layout: 'layout', products });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
