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
    console.log(req);
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
      console.log(user);
      res.render('profile/index', { title: 'Perfil' });
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
      console.log(user);
      res.render('profile/edit', { title: `Editar ${user.name}`, ...user });
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
router.put('/update', auth.isAuthenticated, (req, res) => {
  const userData = req.body.user;
  User.update(req.session.userUid, userData).catch((error) => {
    console.log(error.message);
    res.redirect('/error');
  });
  User.getById(req.session.userUid).then((currentUser) => {
    console.log(currentUser);
    res.redirect('/user');
  }).catch((error) => {
    console.log(error.message);
    res.redirect('/error');
  });
});

module.exports = router;
