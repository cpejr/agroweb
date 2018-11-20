const express = require('express');
const firebase = require('firebase');
const Newsletter = require('../models/newsletter');
const Product = require('../models/product');
const Offer = require('../models/offer');
const User = require('../models/user');
const auth = require('./middleware/auth');
const Transaction = require('../models/transaction.js');

const router = express.Router();

/* GET Admin Home page */
router.get('/', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  res.render('admin/index', { title: 'Administrador', layout: 'layoutDashboard' });
});

/* GET Users - Show all users */
router.get('/users', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getByQuerySorted().then((users) => {
    console.log(users);
    res.render('admin/users', { title: 'Usuários', layout: 'layout', users });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* GET Products - Show all products docs */
router.get('/products', (req, res) => {
  Product.getByQuerySorted({ status: 'Aprovado' }).then((products) => {
    console.log(products);
    res.render('admin/products', { title: 'Produtos', layout: 'layout', products });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* GET Newsletter - Show all newsletter docs */
router.get('/newsletter', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Newsletter.getAll().then((newsletter) => {
    console.log(newsletter);
    res.render('admin/newsletter', { title: 'Usuários', layout: 'layout', newsletter });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* GET Offers - Show all offers */
router.get('/offers', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Offer.getAll().then((offers) => {
    res.render('admin/offer', { title: 'Administrador', layout: 'layout', offers });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET DeleteOffer - Delete a Offer in the database
 */
router.get('/:id/deleteOffer', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Offer.delete(req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/admin/offers');
});

/* GET Transaction - Show all pending tickets */
router.get('/transaction', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Transaction.getAll().then((transactions) => {
    res.render('admin/transaction', { title: 'Administrador', layout: 'layout', transactions });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});


/* GET Users - Show all users */
router.get('/requisitions/users', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getByQuerySorted({ status: 'Aguardando aprovação' }).then((users) => {
    res.render('admin/requisitions/users', { title: 'Requisições de cadastro', layout: 'layout', users });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* GET Users - Show all users */
router.get('/requisitions/products', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Product.getByQuerySorted({ status: 'Aguardando' }).then((products) => {
    console.log(products);
    res.render('admin/requisitions/products', { title: 'Requisições de produtos', layout: 'layout', products });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET updateTransaction - Update a Transaction in the database
 */
router.post('/:id/updateTransaction', auth.isAuthenticated, (req, res) => {
  const transaction = {
    status: req.body.status
  };
  Transaction.update(req.params.id, transaction).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/user/orders');
});

router.post('/:id/updateTaxTransaction', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  console.log(req.body.taxStatus);
  const transaction = {
    taxStatus: req.body.taxStatus
  };
  Transaction.update(req.params.id, transaction).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/admin/transaction');
});

router.post('/:id/updateUserActive', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const user = {
    status: req.body.status
  };
  User.update(req.params.id, user).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/admin/users');
  console.log(req.body.status);
});

router.post('/:id/requisitions/users', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const user = {
    status: req.body.status
  };
  User.update(req.params.id, user).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  console.log(req.body.status);
  res.redirect('/admin/requisitions/users');
});

router.post('/:id/requisitions/products', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const product = {
    status: "Aprovado"
  };
  Product.update(req.params.id, product).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/admin/requisitions/products');
});


/* GET Offers - Show all offers */
router.get('/groups', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Offer.getAll().then((groups) => {
    res.render('groups/index', { title: 'Grupos de Compra', layout: 'layout', groups });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
