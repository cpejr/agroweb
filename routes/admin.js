const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const Newsletter = require('../models/newsletter.js');
const auth = require('./middleware/auth');

const router = express.Router();

/* GET HOME - TESTES */
router.get('/', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  res.render('admin/index', { title: 'Administrador', layout: 'layout' });
});

/* GET USERS - TESTES */
router.get('/users', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getAll().then((users) => {
    console.log(users);
    res.render('admin/users', { title: 'Usuários', layout: 'layout', users });
  }).catch((err) => {
    console.log(err);
  });
});

/* GET NEWSLETTER - TESTES */
router.get('/newsletter', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Newsletter.getAll().then((newsletter) => {
    console.log(newsletter);
    res.render('admin/newsletter', { title: 'Usuários', layout: 'layout', newsletter });
  }).catch((err) => {
    console.log(err);
  });
});

/* GET HOME - TESTES */
router.get('/offers', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  res.render('admin/index', { title: 'Administrador', layout: 'layout' });
});

module.exports = router;
