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
    products.forEach((product) => {
      const queryOffer = { product: product._id, delivery: '48 horas', active: true };
      const sortOffer = { 'price.low': 1 };
      const queryGroup = { productId: product._id, active: true };
      const sortGroup = {};
      let promise = Offer.getByQuerySorted(queryOffer, sortOffer);
      offerPromises.push(promise);
      promise = Group.getByQuerySorted(queryGroup, sortGroup);
      groupPromises.push(promise);
    });
    Promise.all(offerPromises).then((offerResults) => {
      Promise.all(groupPromises).then((groupResults) => {
        const groups = groupResults[0].concat(groupResults[1]);
        const offers = offerResults[0].concat(offerResults[1]);
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
        res.render('results', { title: `Resultados para "${req.query.filter}"`, groups, offers });
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
