const express = require('express');
const Chem = require('../models/chem');
const Product = require('../models/product');
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
    res.redirect('/error');
  });
});

/**
 * GET New - Show form to create new product
 */
router.get('/new', (req, res) => {
  Chem.getByQuerySorted({}, { name: 1 }).then((chems) => {
    console.log(chems[0]);
    res.render('products/new', { title: 'Novo Produto', chems });
  }).catch((err) => {
    console.log(err);
    res.redirect('/error');
  });
});

/**
 * POST Create - Add new product to DB
 */
router.post('/', (req, res) => {
  const { product } = req.body;
  console.log(product);
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
router.get('/:id/edit', auth.canSell, (req, res) => {
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
    category: req.body.category,
    manufacturer: req.body.manufacturer,
    description: req.body.description,
    unit: req.body.unit
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