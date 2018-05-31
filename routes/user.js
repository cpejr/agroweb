const express = require('express');
const firebase = require('firebase');
const firestore = require('firebase/firestore');

var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      firebase.firestore().collection('users').doc(user.uid).get().then((doc) => {
        if (doc.data().userType === 'Franqueado') {
          res.render('user', { title: 'Franqueado', extraJS: ['navbar'], layout: 'layout' });
        }
        else if (doc.data().userType === 'Indústria') {
          res.render('user', { title: 'Indústria', extraJS: ['navbar'], layout: 'layout' });
        }
        else if (doc.data().userType === 'Produtor') {
          res.render('user', { title: 'Produtor', extraJS: ['navbar'], layout: 'layout' });
        }
        else if (doc.data().userType === 'Revendedor') {
          res.render('user', { title: 'Revendedor', extraJS: ['navbar'], layout: 'layout' });
        }
      }).catch((error) => {
        res.redirect('/error');
      });
    }
    else {
      res.redirect('/login');
    }
  });
});

router.get('/results', (req, res, next) => {
  res.render('results', { title: 'Resultado', extraJS: ['navbar'], layout: 'layout' });
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
