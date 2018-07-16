const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const auth = require('./middleware/auth');

var router = express.Router();

/* GET users listing. */
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

router.get('/update', auth.isAuthenticated, (req, res) => {
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


router.get('/results', (req, res) => {
  res.render('results', { title: 'Resultado', layout: 'layout' });
});

/* ////////////////////////////////////
  BackEnd - CADASTRO DE NOVOS PRODUTOS
//////////////////////////////////// */
router.post('/newproduct', (req, res) => {
  const {
    name,
    category
  } = req.body;

  firebase.firestore().collection('categories').doc(category).set({
    name
  })
    .then(() => {
      console.log('Document written!');
      res.redirect('/');
    }).catch((error) => {
      console.log('Error ading document: ', error);
      res.redirect('/error');
    });
});

module.exports = router;
