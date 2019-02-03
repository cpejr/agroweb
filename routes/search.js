var express = require('express');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Product = require('../models/product');
const Chem = require('../models/chem');

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
    if (products.length !== 0) {
      products.forEach((product) => {
        const queryOffer = { product: product._id, $or: [{ delivery: '48 horas' }, { megaOpportunity: true }], active: true };
        const sortOffer = { 'product.name': 1, delivery: -1, 'price.low': 1 };
        const queryGroup = { productId: product._id, active: true };
        const sortGroup = { 'offer.product.name': 1, delivery: -1, unitPrice: 1 };
        let promise = Offer.getByQuerySorted(queryOffer, sortOffer);
        offerPromises.push(promise);
        promise = Group.getByQuerySorted(queryGroup, sortGroup);
        groupPromises.push(promise);
      });
      Promise.all(offerPromises).then((offerResults) => {
        Promise.all(groupPromises).then((groupResults) => {
          let groups = groupResults[0].concat(groupResults[1]);
          let offers = offerResults[0].concat(offerResults[1]);
          for (let i = 2; i < groupResults.length; i++) {
            groups = groups.concat(groupResults[i]);
          }
          for (let i = 2; i < offerResults.length; i++) {
            offers = offers.concat(offerResults[i]);
          }
          console.log(groups);
          console.log(offers);

          let indexes = [];
          let index = groups.indexOf(undefined);
          while (index !== -1) {
            indexes.push(index);
            index = groups.indexOf(undefined, index + 1);
          }
          indexes.reverse();
          indexes.forEach((idx) => {
            groups.splice(idx, 1);
          });

          indexes = [];
          index = offers.indexOf(undefined);
          while (index !== -1) {
            indexes.push(index);
            index = offers.indexOf(undefined, index + 1);
          }
          indexes.reverse();
          indexes.forEach((idx) => {
            offers.splice(idx, 1);
          });

          console.log(groups);
          console.log(offers);
          res.render('results', { title: `Resultados para "${req.query.filter}"`, groups, offers, ...req.session });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    else {
      res.render('results', { title: `Resultados para "${req.query.filter}"`, ...req.session });
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Products' names array
 */
router.get('/products', (req, res) => {
  const names = [];
  const queryProduct = { active: true };
  const sortProduct = { name: 1 };
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    products.forEach((product) => {
      if (product.status === 'Aprovado') {
        names.push(product.name);
      }
    });
    console.log(names);
    res.send(names);
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Product's object
 */
router.post('/products', (req, res) => {
  Product.getByQuerySorted({ name: req.body.productName }, {}).then((product) => {
    res.send(product);
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Chems' names array
 */
router.get('/chems', (req, res) => {
  const names = [];
  const queryChem = { active: true };
  const sortChem = { name: 1 };
  Chem.getByQuerySorted(queryChem, sortChem).then((chems) => {
    chems.forEach((chem) => {
      names.push(chem.name);
    });
    console.log(names);
    res.send(names);
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
