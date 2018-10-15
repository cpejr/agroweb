const express = require('express');
const firebase = require('firebase');
const Email = require('../models/email');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');

var router = express.Router();

/**
 * GET User Home page
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  if (req.session.userType === 'Administrador') {
    res.redirect('/admin');
  }
  else if (req.session.userType === 'Franqueado') {
    res.render('user', { title: 'Franqueado', layout: 'layoutDashboard', ...req.session });
  }
  else if (req.session.userType === 'Indústria') {
    res.render('user', { title: 'Indústria', layout: 'layoutDashboard', ...req.session });
  }
  else if (req.session.userType === 'Produtor') {
    res.render('user', { title: 'Produtor', layout: 'layoutDashboard', ...req.session });
  }
  else if (req.session.userType === 'Revendedor') {
    res.render('user', { title: 'Revendedor', layout: 'layoutDashboard', ...req.session });
  }
});

/**
 * GET orders - Show all user's orders
 */
router.get('/orders', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      User.getAllOpenTransactionsByUserId(req.session._id).then((transactions) => {
        // console.log(transactions);
        if (req.session.userType === 'Indústria') {
          res.render('orders', { title: 'Demandas', layout: 'layout', transactions });
        }
        else {
          res.render('orders', { title: 'Minhas compras', layout: 'layout', transactions });
        }
      }).catch((err) => {
        console.log(err);
        res.redirect('/user');
      });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/user');
  });
});

/**
 * GET offers - Show all user's offers
 */
router.get('/offers', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      User.getAllOffersByUserId(req.session._id).then((offers) => {
        console.log(offers);
        res.render('offers/index', { title: 'Minhas ofertas', layout: 'layout', offers });
      }).catch((err) => {
        console.log(err);
        res.redirect('/error');
      });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/user');
  });
});

/**
 * GET history - Show the user's buying history
 */
router.get('/history', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      User.getAllTransactionsByUserId(req.session._id).then((transactions) => {
        console.log(transactions);
        res.render('orders', { title: 'Histórico', layout: 'layout', transactions });
      }).catch((err) => {
        console.log(err);
        res.redirect('/user');
      });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/user');
  });
});

/**
 * GET Profile/index - Show all user's details
 */
router.get('/profile', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      res.render('profile', { title: 'Perfil', layout: 'layout', user });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/user');
  });
});

/**
 * GET Edit - Show the user edit form
 */
router.get('/profile/edit', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      res.render('profile/edit', { title: 'Editar', layout: 'layout', user });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/user');
  });
});

/**
 * PUT Update - Update a user in the database
 */
router.post('/update', auth.isAuthenticated, (req, res) => {
  const userData = req.body.user;

  // Separates the first name from the rest
  const position = userData.fullName.indexOf(' ');
  userData.firstName = userData.fullName.slice(0, position);

  User.update(req.session._id, userData).catch((err) => {
    console.log(err);
  });
  res.redirect('/user/profile');
});

/**
 * POST buy - Buy all products from myCart
 */
router.post('/buy', auth.isAuthenticated, (req, res) => {
  const userId = req.session._id;
  const transaction = {
    status: 'Aguardando boleto'
  };
  User.getAllQuotationsByUserId(userId).then((quotations) => {
    console.log(quotations);
    quotations.forEach((quotation) => {
      User.addTransaction(userId, quotation._id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      Email.buyEmail(quotation).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      User.addTransaction(quotation.offer.seller._id, quotation._id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      Email.sellEmail(quotation).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      Email.adminNewTransactionEmail(quotation).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      User.removeFromMyCart(userId, quotation._id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      Transaction.update(quotation._id, transaction).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    })
    res.redirect('/user/orders');
  });
});

/**
 * GET beFranchisee page
 */
router.get('/beFranchisee', auth.isAuthenticated, (req, res) => {
  res.render('beFranchisee', { title: 'Seja Franqueado', layout: 'layout' });
});



module.exports = router;
