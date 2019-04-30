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
 * GET Terms page
 */
router.get('/terms', (req, res) => {
  res.render('terms', { title: 'Termos', layout: 'layout', ...req.session });
});

/**
 * GET Forgot my Password page
 */
router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', { title: 'Esqueci minha senha', layout: 'layoutLogin' });
});

/**
 * GET Franchisee Option page
 */
router.get('/franchiseeOption', (req, res) => {
  res.render('franchisee', { title: 'Informações Franqueado', layout: 'layoutHome' });
});

/**
 * GET Industry Option page
 */
router.get('/industryOption', (req, res) => {
  res.render('industryOption', { title: 'Informações Indústria', layout: 'layoutLogin' });
});

/**
 * GET Dealer Option page
 */
router.get('/dealerOption', (req, res) => {
  res.render('dealerOption', { title: 'Informações Revendedor', layout: 'layoutLogin' });
});

/**
 * GET Producer Option page
 */
router.get('/producerOption', (req, res) => {
  res.render('producerOption', { title: 'Informações Produtor', layout: 'layoutLogin' });
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
    res.render('login', { title: 'Login', layout: 'layoutLogin' });
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
  res.render('signup', { title: 'Cadastro', layout: 'layoutLogin' });
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
        req.session.userId = currentLogged._id;
        req.session.userUid = user.uid;
        req.session.email = currentLogged.email;
        req.session.userStatus = currentLogged.status;
        if (currentLogged.type === 'Produtor') {
          req.session.franchisee = currentLogged.agreementList;
        }
        if (req.session.userType === 'Administrador') {
          res.redirect('/admin');
        }
        else {
          console.log(req.session);
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
    switch (error.code) {
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
    console.log(`Error Code: ${error.code}`);
    console.log(`Error Message: ${error.message}`);
    res.redirect('/login');
  });
});

/**
 * POST RecoverPassword Request
 */
router.post('/recoverPassword', (req, res) => {
  const mail = req.body;
  firebase.auth().sendPasswordResetEmail(mail.email).then(() => {
    req.flash('success', 'Enviamos um e-mail de redefinição para a sua conta.');
    res.redirect('/login');
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
    if (req.session.userStatus === 'Aguardando aprovação') {
      req.flash('warning', 'Sua solicitação de cadastro foi enviada para a equipe que avaliará seus dados antes de ativar sua conta.');
    }
    else if (req.session.userStatus === 'Bloqueado') {
      req.flash('warning', 'Essa conta não pode ser utilizada porque está bloqueada.')
    }
    delete req.session.userType;
    delete req.session.firstName;
    delete req.session.fullName;
    delete req.session.userId;
    delete req.session.userUid;
    delete req.session.email;
    delete req.session.userStatus;
    res.redirect('/login');
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
  if (position > -1) {
    userData.firstName = userData.name.slice(0, position);
  }
  else {
    userData.firstName = userData.name;
  }
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
      req.session.userStatus = 'Aguardando aprovação';
      req.session.userId = docId;
      if (req.session.userType === 'Franqueado') {
        Email.signedUpFranchisee(userData.email).catch((error) => {
          req.flash('danger', 'Falha no envio do email.');
          res.redirect('/login');
        });
        res.redirect('/user');
      }
      else {
        Email.waitingForApprovalEmail(userData).catch((error) => {
          req.flash('danger', 'Não foi possível enviar o email para o novo usuário.');
          res.redirect('/login');
        });
        if (req.session.userType === 'Indústria') {
          res.render('industryMegaPremio', { title: 'Indústria', ...req.session });
        }
        else if (req.session.userType === 'Revendedor') {
          res.render('dealerMegaOportunidade', { title: 'Revendedor', layout: 'layout', ...req.session });
        }
        else {
          res.redirect('/user');
        }
      }
    }).catch((error) => {
      var userLogged = firebase.auth().currentUser;
      userLogged.delete().catch((error) => {
        req.flash('danger', 'Não foi possível liberar o email para nova utilização');
      });

      switch (error.code) {
        case '11000':
          req.flash('danger', 'O CPF já está cadastrado.');
          break;
        default:
          req.flash('danger', 'Erro ao criar o perfil.');
      }
      console.log(error);
      res.redirect('/signup');
    });
  }).catch((error) => {
    switch (error.code) {
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
        req.flash('danger', 'Erro ao preencher os campos.');
    }
    console.log(`Error Code: ${error.code}`);
    console.log(`Error Message: ${error.message}`);
    res.redirect('/signup');
  });
});

module.exports = router;
