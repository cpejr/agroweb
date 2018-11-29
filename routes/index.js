const express = require('express');
const firebase = require('firebase');
const nodemailer = require('nodemailer');
const Email = require('../models/email');
const Group = require('../models/group');
const Newsletter = require('../models/newsletter');
const Offer = require('../models/offer');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Home page
 */
router.get('/', (req, res) => {
  res.redirect('/site');
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
      console.log(req.session);
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
  if ('userType' in req.session) {
    if (req.session.userType === 'Administrador') {
      res.redirect('/admin');
    }
    else {
      res.redirect('/user');
    }
  }
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
        req.session.status = currentLogged.status;
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
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {

    switch(error.code) {
    case 'auth/wrong-password':
        req.flash('danger', 'Senha incorreta.');
        break;
    case 'auth/user-not-found':
        req.flash('danger', 'Email não cadastrado.');
        break;
    case 'auth/invalid-email':
        req.flash('danger', 'Verifique se o email está digitado corretamente.');
        break;
    case 'auth/network-request-failed':
        req.flash('danger', 'Falha na internet. Verifique sua conexão de rede.');
        break;
    default:
        req.flash('danger', 'Erro indefinido.');
      }

    console.log('Error Code: ' + error.code);
    console.log('Error Message: ' + error.message);
    res.redirect('/login');
  });
});

/**
 * POST RecoverPassword Request
 */
router.post('/recoverPassword', (req, res) => {
  const mail = req.body;
  firebase.auth().sendPasswordResetEmail(mail.email).then(() => {
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
    if (req.session.status === 'Aguardando aprovação' || req.session.status === 'Bloqueado') {
      const { status } = req.session;
      res.redirect('/user/status');
    }
    else {
      delete req.session.userType;
      delete req.session.firstName;
      delete req.session.fullName;
      delete req.session._id;
      delete req.session.userUid;
      delete req.session.email;
      delete req.session.status;
      res.redirect('/');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * POST Signup Request
 */
router.post('/signup', (req, res) => {
  const userData = req.body.user;

  // Separates the first name from the rest
  const position = userData.name.indexOf(' ');
  userData.firstName = userData.name.slice(0, position);

  userData.fullName = userData.name;
  delete userData.name;
  firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password).then((user) => {
    userData.uid = user.uid;
    delete userData.password;
    User.create(userData).then((docId) => {
      req.session.userType = userData.type;
      req.session.firstName = userData.firstName;
      req.session.fullName = userData.name;
      req.session.email = userData.email;
      req.session.userUid = user.uid;
      req.session.status = 'Aguardando aprovação';
      req.session._id = docId;
      if (req.session.userType === 'Indústria') {
        res.render('industryMegaPremio', { title: 'Indústria' });
      }
      else if (req.session.userType === 'Revendedor') {
        res.render('dealerMegaOportunidade', { title: 'Revendedor', layout: 'layout' });
      }
      else {
        res.redirect('/user');
      }
    }).catch((error) => {
      switch(error.code) {
      case '11000':
          req.flash('danger', 'O CPF já está cadastrado.');
          break;
      default:
          req.flash('danger', 'Erro indefinido.');
        }
      console.log('Error Code: ' + error.code);
      console.log('Error Message: ' + error.message);
      res.redirect('/signup');
    });
  }).catch((error) => {
    switch(error.code) {
    case 'auth/email-already-in-use':
        req.flash('danger', 'Email já cadastrado');
        break;
    case 'auth/network-request-failed':
        req.flash('danger', 'Falha na internet. Verifique sua conexão de rede.');
        break;
    case 'auth/invalid-email':
        req.flash('danger', 'Verifique se o email está digitado corretamente.');
        break;
    default:
        req.flash('danger', 'Erro indefinido.');
      }
    console.log('Error Code: ' + error.code);
    console.log('Error Message: ' + error.message);
    res.redirect('/signup');
  });
});

// router.post('/contact', (req, res) => {
//   console.log("Email enviado");
//   const emailData = req.body.user;
//   console.log(req.body.user);
//   Email.sendEmail(emailData).then((user) => {
//     console.log(user);
//     res.redirect('/success');
//   }).catch((error) => {
//   console.log(error);
//   res.redirect('/error');
// });
// });

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
