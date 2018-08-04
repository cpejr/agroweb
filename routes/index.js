const express = require('express');
const firebase = require('firebase');
const nodemailer = require('nodemailer');
const Email = require('../models/email');
const Newsletter = require('../models/newsletter');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Home page
 */
router.get('/', (req, res) => {
  res.render('home', { title: 'Página inicial', layout: 'layoutHome' });
});

/**
 * GET Forgot my Password page
 */
router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', { title: 'Esqueci minha senha', layout: 'layoutHome' });
});

/**
 * GET Franchisee Option page - TESTES
 */
router.get('/franchiseeOption', (req, res) => {
  res.render('franchiseeOption', { title: 'Informações Franqueado', layout: 'layout' });
});

/**
 * GET SUCCESS - TESTES
 */
router.get('/success', (req, res) => {
  res.render('success', { title: 'Sucesso', layout: 'layout' });
});

/**
 * GET Login page
 */
router.get('/login', (req, res) => {
  if ('userType' in req.session) {
    if (req.session.userType === 'Administrador') {
      res.redirect('/admin');
    }
    else {
      res.redirect('/user');
    }
  }
  else {
    res.render('login', { title: 'Login', layout: 'layoutHome' });
  }
});

/**
 * GET Signup page
 */
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Cadastro', layout: 'layoutHome' });
});

/**
 * POST Login Request
 */
router.post('/login', (req, res) => {
  const userData = req.body.user;
  firebase.auth().signInWithEmailAndPassword(userData.email, userData.password).then((user) => {
    User.getByUid(user.uid).then((currentLogged) => {
      if (currentLogged) {
        req.session.userType = currentLogged.type;
        req.session.firstName = currentLogged.firstName;
        req.session.fullName = currentLogged.fullName;
        req.session._id = currentLogged._id;
        req.session.userUid = user.uid;
        req.session.email = currentLogged.email;
        if (req.session.userType === 'Administrador') {
          res.redirect('/admin');
        }
        else {
          res.redirect('/user');
        }
      }
      else {
        console.log('Document not found');
        res.redirect('/error');
      }
    }).catch((error) => {
      console.log(error.message);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error.message);
    res.redirect('/error');
  });
});

/**
 * POST RecoverPassword Request
 */
router.post('/recoverPassword', (req, res) => {
  const { mail } = req.body;
  firebase.auth().sendPasswordResetEmail(mail).then(() => {
    res.redirect('/success');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Logout Request
 */
router.get('/logout', auth.isAuthenticated, (req, res) => {
  firebase.auth().signOut().then(() => {
    delete req.session.userType;
    delete req.session.firstName;
    delete req.session.fullName;
    delete req.session._id;
    delete req.session.userUid;
    delete req.session.email;
    res.redirect('/');
  }).catch((error) => {
    console.log(error.code);
    console.log(error.message);
    res.redirect('/error');
  });
});

/**
 * POST Signup Request
 */
router.post('/signup', (req, res) => {
  const userData = req.body.user;

  // Separates the first name from the rest
  const position = userData.fullName.indexOf(' ');
  userData.firstName = userData.fullName.slice(0, position);


  req.session.userType = userData.type;
  req.session.firstName = userData.firstName;
  req.session.fullName = userData.fullName;
  req.session.email = userData.email;

  firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password).then((user) => {
    req.session.userUid = user.uid;
    userData.uid = user.uid;
    delete userData.password;
    User.create(userData).then((docId) => {
      req.session._id = docId;
      if (req.session.userType === 'Indústria') {
        res.render('industryMegaPremio', { title: 'Indústria', layout: 'layout' });
      }
      else if (req.session.userType === 'Revenda'){
        res.render('dealerMegaOportunidade', { title: 'Revenda', layout: 'layout' });
      }
      else {
        res.redirect('/user');
      }
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

// /**
//  * POST Contact Request
//  */
router.post('/contact', (req, res) => {
  const emailData = req.body.user;
  console.log(req.body.user);
  Email.sendEmail(emailData).then((user) => {
    console.log(user);
    res.redirect('/success');
  }).catch(err => console.log(err));
});

// /**
//  * POST NewsletterMail Request
//  */
// router.post('/newslettermail', (req, res) => {
//   var clientList = firebase.firestore().collection('newsletter');
//   var mailList = clientList.where('email', '==', true);
//   console.log(mailList);
//   res.redirect('/success');
// });

module.exports = router;
