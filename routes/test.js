const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const Newsletter = require('../models/newsletter.js');
const auth = require('./middleware/auth');

var router = express.Router();

/**
 * GET Test Home page
 */
router.get('/testando', (req, res) => {
  const user = {
    fullName: 'Ariel Ribeiro',
    email: 'arielribeiro@cpejr.com.br'
  };
  Newsletter.create(user).then(() => {
    console.log('criou usuário');
  }).catch(err => console.log(err));
  res.render('profile/index', { title: 'Teste' });
});

module.exports = router;
