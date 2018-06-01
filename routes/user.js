const express = require('express');
const firebase = require('firebase');
const auth = require('./middleware/auth');

var router = express.Router();

/* GET users listing. */
router.get('/', auth.isAuthenticated, (req, res, next) => {
  if (req.session.userType === 'Administrador') {
    res.redirect('/admin');
  }
  else if (req.session.userType === 'Franqueado') {
    res.render('user', { title: 'Franqueado', layout: 'layout' });
  }
  else if (req.session.userType === 'Indústria') {
    res.render('user', { title: 'Indústria', layout: 'layout' });
  }
  else if (req.session.userType === 'Produtor') {
    res.render('user', { title: 'Produtor', layout: 'layout' });
  }
  else if (req.session.userType === 'Revendedor') {
    res.render('user', { title: 'Revendedor', layout: 'layout' });
  }
});

router.get('/results', (req, res, next) => {
  res.render('results', { title: 'Resultado', layout: 'layout' });
});

/* ////////////////////////////////////
  BackEnd - CADASTRO DE NOVOS PRODUTOS
//////////////////////////////////// */
router.post('/newproduct', (req, res, next) => {
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
