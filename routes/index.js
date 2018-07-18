const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const auth = require('./middleware/auth');
const nodemailer = require('nodemailer');
const Transaction = require('../models/transaction.js');
const Email = require('../models/email.js');
const Newsletter = require('../models/newsletter.js');

const router = express.Router();

/**
 * GET Home page
 */
router.get('/', (req, res) => {
  res.render('home', { title: 'Página inicial', layout: 'layout' });
});

router.get('/profile', (req, res) => {
  res.render('profile/index', { title: 'Seu perfil', layout: 'layout' });
});

/**
 * GET ForgotPassword page
 */
router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', { title: 'Esqueci minha senha', layout: 'layout' });
});

/**
 * GET FranchiseeOption page - TESTES
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
    res.render('login', { title: 'Login', layout: 'layout' });
  }
});

/**
 * GET Signup page
 */
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Cadastro', layout: 'layout' });
});

/**
 * GET Sales/index page  - TESTES
 */
router.get('/sales', (req, res) => {
  const product1 = {
    id: 12312312,
    name: 'produto1',
    date: '19/03/2021',
    statusPayment: 'Não pago',
    statusDeliver: 'Não entregue'
  };
  const product2 = {
    id: 53434223,
    name: 'produto2',
    date: '19/03/2021',
    statusPayment: 'Pago',
    statusDeliver: 'Não entregue'
  };
  const product3 = {
    id: 232312314,
    name: 'produto3',
    date: '19/03/2021',
    statusPayment: 'Pago',
    statusDeliver: 'Entregue'
  };
  const orders = [product1, product2, product3];
  res.render('sales/index', { title: 'Minhas compras', layout: 'layout', orders });
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
      res.redirect('/user');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * POST Contact Request
 */
router.post('/contact', (req, res) => {
  const emailData = req.body.data;
  console.log(req.body.data);
  Email.sendEmail(emailData).then((info) => {
    console.log(info);
    res.redirect('/success');
  }).catch(err => console.log(err));
});

/**
 * POST NewsletterMail Request
 */
router.post('/newslettermail', (req, res) => {
  var clientList = firebase.firestore().collection('newsletter');
  var mailList = clientList.where('email', '==', true);
  console.log(mailList);
  res.redirect('/success');
});

module.exports = router;
