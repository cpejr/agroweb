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
  res.render('terms', { title: 'Termos', layout: 'layout' });
});

/**
 * GET Forgot my Password page
 */
router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', { title: 'Esqueci minha senha', layout: 'layoutHome' });
});

/**
 * GET Franchisee Option page
 */
router.get('/franchiseeOption', (req, res) => {
  res.render('franchiseeOption', { title: 'Informações Franqueado', layout: 'layoutHome' });
});

router.get('/industryOption', (req, res) => {
  res.render('industryOption', { title: 'Informações Indústria', layout: 'layoutHome' });
});

router.get('/dealerOption', (req, res) => {
  res.render('dealerOption', { title: 'Informações Revendedor', layout: 'layoutHome' });
});

router.get('/producerOption', (req, res) => {
  res.render('producerOption', { title: 'Informações Produtor', layout: 'layoutHome' });
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
        if (currentLogged.type === 'Produtor') {
          req.session.franchisee = currentLogged.agreementList;
        }
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
    if (req.session.status === 'Aguardando aprovação') {
      req.flash('warning', 'Sua solicitação de cadastro foi enviada para a equipe que avaliará seus dados antes de ativar sua conta.');
    }
    else if (req.session.status === 'Bloqueado') {
      req.flash('warning', 'Essa conta não pode ser utilizada porque está bloqueada.')
    }
    delete req.session.userType;
    delete req.session.firstName;
    delete req.session.fullName;
    delete req.session._id;
    delete req.session.userUid;
    delete req.session.email;
    delete req.session.status;
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
  console.log(userData.address.city);
  if ((userData.address.city == 'Sorriso')||
      (userData.address.city == 'Nova Ubiratã')||
      (userData.address.city == 'Ipiranga do Norte')||
      (userData.address.city == 'Boa Esperança')||
      (userData.address.city == 'Ipiranga do Norte')||
      (userData.address.city == 'Tapurah')||
      (userData.address.city == 'Vera')||
      (userData.address.city == 'Feliz Natal')) {

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
        console.log(userData);
        Email.waitingForApprovalEmail(userData).catch((error) => {
          req.flash('danger', 'Não foi possível enviar o email para o novo usuário.');
          res.redirect('/login');
        });
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
        switch (error.code) {
          case '11000':
            req.flash('danger', 'O CPF já está cadastrado.');
            break;
          default:
            req.flash('danger', 'Erro indefinido.');
        }
        console.log(`Error Code: ${error.code}`);
        console.log(`Error Message: ${error.message}`);
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
          req.flash('danger', 'Erro indefinido.');
      }
      console.log(`Error Code: ${error.code}`);
      console.log(`Error Message: ${error.message}`);
      res.redirect('/signup');
    });

  }
  else {
    req.flash('success', 'A plataforma MegaPool não está disponível na sua região.');
    res.redirect('/logout');
  }
});

//terms
router.get('/terms', (req, res) => {
  res.render('terms', { title: 'Termos de uso', layout: 'layoutDashboard' });
});

module.exports = router;
