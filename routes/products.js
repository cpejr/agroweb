const express = require('express');
const Chem = require('../models/chem');
const Product = require('../models/product');
const User = require('../models/user');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all Products
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  Product.getAll().then((products) => {
    res.render('products/index', { title: 'Produtos', products, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET New - Show form to create new product
 */
router.get('/new', auth.isAuthenticated, (req, res) => {
  User.getById(req.session.userId).then((user) => {
    console.log(user);
    res.render('products/new', { title: 'Novo Produto', user, ...req.session });
  }).catch((error) => {
    req.flash('danger', 'Não foi possível fazer o pedido.');
    res.redirect('/user');
  });
});

/**
 * POST Create - Add new product to DB
 */
router.post('/', auth.isAuthenticated, (req, res) => {
  if (req.body.chem) {
    const { product } = req.body;
    const { userType } = req.session;
    if (userType === 'Administrador') {
      product.status = 'Aprovado';
    }
    else {
      product.status = 'Aguardando';
    }

    const promises = [];
    const chemsIDs = [];

    req.body.chem.forEach((chemName) => {
      const regex = new RegExp(chemName, 'i');
      const promise = Chem.getOneByQuery({ name: regex });
      promises.push(promise);
    });

    Promise.all(promises).then((chems) => {
      chems.forEach((chem) => {
        chemsIDs.push(chem._id);
      });
      product.chems = chemsIDs;
      Product.create(product).then((id) => {
        console.log(`Created new product with id: ${id}`);
        if (userType === 'Administrador') {
          req.flash('success', 'Produto criado com sucesso.');
        }
        else {
          req.flash('success', 'Pedido de aprovação do produto feito com sucesso.');
        }
        res.redirect(`/products/${id}`);
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
    req.flash('danger', 'É necessário inserir um princípio ativo antes de criar o produto.');
    res.redirect(`/products/new`);
  }
});

/**
 * GET Show - Show details of a product
 */
router.get('/:id', auth.isAuthenticated, (req, res) => {
  Product.getById(req.params.id).then((product) => {
    if (product) {
      console.log(product);
      res.render('products/show', { title: product.name, id: req.params.id, ...product, ...req.session });
    }
    else {
      console.log('Product not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Edit - Show the product edit form
 */
router.get('/:id/edit', auth.isAuthenticated, (req, res) => {
  Product.getById(req.params.id).then((product) => {
    if (product) {
      res.render('products/edit', { title: `Editar ${product.name}`, id: req.params.id, ...product, ...req.session });
    }
    else {
      console.log('Product not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * PUT Update - Update a product in the database
 */
router.put('/:id', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const { product } = req.body;
  Product.update(req.params.id, product).then(() => {
    req.flash('success', 'Produto editado com sucesso.');
    res.redirect('/admin/products');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * DELETE Destroy - Removes a product from the databse
 */
router.delete('/:id', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Product.delete(req.params.id).then(() => {
    req.flash('success', 'Produto removido.');
    res.redirect('/admin/products');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
