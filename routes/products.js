const express = require('express');
const Product = require('../models/product.js');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all Products
 */
router.get('/', (req, res) => {
  Product.getAll().then((products) => {
    console.log(products);
    res.render('products/index', { title: 'Produtos', products });
  }).catch((err) => {
    console.log(err);
  });
});

/**
 * GET New - Show form to create new product
 */
router.get('/new', auth.isIndustry, auth.isDealer, (req, res) => {
  res.render('products/new', { title: 'Novo Produto' });
});

/**
 * POST Create - Add new product to DB
 */
router.post('/', (req, res) => {
  const product = {
    name: req.body.name,
    price: req.body.price
  };
  Product.create(product).then((id) => {
    console.log(`Created new product with id: ${id}`);
    res.redirect(`/products/${id}`);
  }).catch((err) => {
    console.log(err);
    res.redirect('/products');
  });
});

/**
 * GET Show - Show details of a product
 */
router.get('/:id', (req, res) => {
  Product.getById(req.params.id).then((product) => {
    if (product) {
      console.log(product);
      res.render('products/show', { title: product.name, id: req.params.id, ...product });
    }
    else {
      console.log('Product not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/products');
  });
});

/**
 * GET Edit - Show the product edit form
 */
router.get('/:id/edit', auth.isIndustry, auth.isDealer, (req, res) => {
  Product.getById(req.params.id).then((product) => {
    if (product) {
      console.log(product);
      res.render('products/edit', { title: `Editar ${product.name}`, id: req.params.id, ...product });
    }
    else {
      console.log('Product not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/products');
  });
});

/**
 * PUT Update - Update a product in the database
 */
router.put('/:id', (req, res) => {
  const product = {
    name: req.body.name,
    price: req.body.price
  };
  Product.update(req.params.id, product).catch((err) => {
    console.log(err);
  });
  res.redirect(`/products/${req.params.id}`);
});

/**
 * DELETE Destroy - Removes a product from the databse
 */
router.delete('/:id', (req, res) => {
  Product.delete(req.params.id).catch((err) => {
    console.log(err);
  });
  res.redirect('/products');
});

module.exports = router;
