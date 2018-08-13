const express = require('express');
const Offer = require('../models/offer');
const Product = require('../models/product');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all offers
 */
router.get('/', (req, res) => {
  Offer.getAll().then((offers) => {
    console.log(offers);
    res.render('offers/index', { title: 'Oferta', offers });
  }).catch((err) => {
    console.log(err);
  });
});

/**
 * GET Teste - Get all products from a category
 */
router.get('/teste?:category', (req, res) => {
  Product.getByQuery(req.query).then((products) => {
    console.log(products);
    res.render('offers/productSelector', { products });
  }).catch((err) => {
    console.log(err);
  });
});

/**
 * GET New - Show form to create new offer
 */
router.get('/new', (req, res) => {
  res.render('offers/new', { title: 'Nova Oferta' });
});

/**
 * POST Create - Add new offer to DB
 */
router.post('/', (req, res) => {
  const { offer } = req.body;
  Offer.create(offer).then((id) => {
    console.log(`Created new offer with id: ${id}`);
    res.redirect(`/offers/${id}`);
  }).catch((err) => {
    console.log(err);
    res.redirect('/offers');
  });
});

/**
 * GET Show - Show details of a offer
 */
router.get('/:id', (req, res) => {
  Offer.getById(req.params.id).then((offer) => {
    if (offer) {
      console.log(offer);
      res.render('offers/show', { title: offer.name, id: req.params.id, ...offer });
    }
    else {
      console.log('Offer not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/offers');
  });
});

/**
 * GET Edit - Show the offer edit form
 */
router.get('/:id/edit', auth.canSell, (req, res) => {
  Offer.getById(req.params.id).then((offer) => {
    if (offer) {
      console.log(offer);
      res.render('offers/edit', { title: `Editar ${offer.name}`, id: req.params.id, ...offer });
    }
    else {
      console.log('Offer not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/offers');
  });
});

/**
 * PUT Update - Update a offer in the database
 */
router.put('/:id', (req, res) => {
  const { offer } = req.body;
  Offer.update(req.params.id, offer).catch((err) => {
    console.log(err);
  });
  res.redirect(`/offers/${req.params.id}`);
});

/**
 * DELETE Destroy - Removes a offer from the databse
 */
router.delete('/:id', (req, res) => {
  Offer.delete(req.params.id).catch((err) => {
    console.log(err);
  });
  res.redirect('/offers');
});

module.exports = router;
