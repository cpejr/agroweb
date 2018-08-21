const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
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
    res.render('user', { title: 'Franqueado', layout: 'layout', ...req.session });
  }
  else if (req.session.userType === 'Indústria') {
    res.render('user', { title: 'Indústria', layout: 'layout', ...req.session });
  }
  else if (req.session.userType === 'Produtor') {
    res.render('user', { title: 'Produtor', layout: 'layout', ...req.session });
  }
  else if (req.session.userType === 'Revendedor') {
    res.render('user', { title: 'Revendedor', layout: 'layout', ...req.session });
  }
});

/**
 * GET Profile/index - Show all user's details
 */
router.get('/profile', auth.canSell, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      res.render('profile', { title: 'Perfil', user });
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
router.get('/profile/edit', auth.canSell, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      res.render('profile/edit', { title: 'Editar', user });
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

router.get('/orders', auth.isAuthenticated, (req, res) => {
  User.getAllTransactionsByUserId(req.session._id).then((orders) => {
    if (req.session.userType === 'Indústria') {
      console.log(orders);
      res.render('orders', { title: 'Demandas', layout: 'layout', orders });
    }
    else {
      res.render('orders', { title: 'Minhas compras', layout: 'layout', orders });
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/user');
  });
});
module.exports = router;
