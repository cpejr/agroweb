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
const config = require('../docs/config.json');


const router = express.Router();

router.get('/', (req, res) => {
  const { dollar } = global;
  // const groups = [0, undefined, 1, 2, 5, 2, undefined, undefined, undefined, 7, 5, 4, 3, undefined];
  //
  // let indexes = [];
  // let index = groups.indexOf(undefined);
  // while (index !== -1) {
  //   indexes.push(index);
  //   index = groups.indexOf(undefined, index + 1);
  // }
  // indexes.reverse();
  // indexes.forEach((idx) => {
  //   groups.splice(idx, 1);
  // });
  // console.log(indexes);
  // console.log(groups);
  console.log(dollar);
  res.render('teste', { title: 'Teste', dollar });
});

// rotapara industryMegaPremio
router.get('/MegaPremio', (req, res) => {
  res.render('industryMegaPremio', { title: 'MegaPremio', layout: 'layoutHome' });
});

router.put('/:id', (req, res) => {
  const { group } = req.body;
  console.log(group.closeDate);
  console.log(typeof (group.closeDate));

  const b = group.closeDate.split(/\D/);
  console.log(b);
  group.closeDate = new Date(b[0], --b[1], b[2]);
  Group.update(req.params.id, group).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/test');
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

/**
 * GET Clean page
 */
router.get('/clean', (req, res) => {
  res.render('clean', { layout: 'layout' });
});

/**
 * GET Clean groups DB
 */
router.get('/clean/group', (req, res) => {
  Group.clear().then(() => {
    res.redirect('/test/clean');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Clean offers DB
 */
router.get('/clean/offer', (req, res) => {
  Offer.clear().then(() => {
    res.redirect('/test/clean');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Clean products DB
 */
router.get('/clean/product', (req, res) => {
  Product.clear().then(() => {
    res.redirect('/test/clean');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Clean chems DB
 */
router.get('/clean/chem', (req, res) => {
  Chem.clear().then(() => {
    res.redirect('/test/clean');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Clean transactions DB
 */
router.get('/clean/transaction', (req, res) => {
  Transaction.clear().then(() => {
    res.redirect('/test/clean');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Clean users DB
 */
router.get('/clean/user', (req, res) => {
  User.clear().then(() => {
    res.redirect('/test/clean');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Clean newsletters DB
 */
router.get('/clean/newsletter', (req, res) => {
  Newsletter.clear().then(() => {
    res.redirect('/test/clean');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
