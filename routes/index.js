const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const auth = require('./middleware/auth');
const nodemailer = require('nodemailer');
const Transaction = require('../models/transaction.js');
const Email = require('../models/email.js');
const Newsletter = require('../models/newsletter.js');

const router = express.Router();


/* GET HOME - TESTES */
router.get('/', (req, res) => {
  res.render('home', { title: 'Página inicial', layout: 'layout' });
});

/* GET FORGOTPASSWORD - TESTES */
router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', { title: 'Esqueci minha senha', layout: 'layout' });
});

/* GET FORGOTPASSWORD - TESTES */
router.get('/franchiseeOption', (req, res) => {
  res.render('franchiseeOption', { title: 'Informações Franqueado', layout: 'layout' });
});

/* GET SUCCESS - TESTES */
router.get('/success', (req, res) => {
  res.render('success', { title: 'Sucesso', layout: 'layout' });
});

/* GET LOGIN - TESTES */
router.get('/login', (req, res) => {
  if ('userType' in req.session) {
    if (req.session.userType === 'Administrador') {
      res.redirect('/admin');
    }
    else {
      res.redirect('/user');
    }
  }
  res.render('login', { title: 'Login', layout: 'layout' });
});

/* GET SIGNUP - TESTES */
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Cadastro', layout: 'layout' });
});

/* GET ORDERS - TESTES */
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

router.get('/teste', (req, res) => {
  const user = {
    fullName: 'Ariel Ribeiro',
    email: 'arielribeiro@cpejr.com.br'
  };
  Newsletter.create(user).then(() => {
    console.log('criou usuário');
  }).catch(err => console.log(err));
  res.render('', { title: 'Teste' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contato' });
  // res.send('respond with a resource');
});

/* ////////////////////////////
  BackEnd - LOGIN
//////////////////////////// */
router.post('/login', (req, res) => {
  const userData = req.body.user;
  firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
    .then((user) => {
      User.getByUid(user.uid).then((currentLogged) => {
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
      }).catch((error) => {
        console.log(error.message);
        res.redirect('/error');
      });
    }).catch((error) => {
      console.log(error.message);
      res.redirect('/error');
    });
});

/* ////////////////////////////
  BackEnd - RECOVER MY PASS
//////////////////////////// */
router.post('/recoverPassword', (req, res) => {
  const { mail } = req.body;
  firebase.auth().sendPasswordResetEmail(mail).then(() => {
    res.redirect('/success');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  const clientList = firebase.firestore().collection('newsletter');
  const mailList = clientList.where('mail', '==', true);
  console.log(mailList);
});

/* ////////////////////////////
  BackEnd - LOGOUT
//////////////////////////// */
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

/* ///////////////////////////
  BackEnd - CADASTRO
////////////////////////////// */
router.post('/signup', (req, res) => {
  const userData = req.body.user;

  // Separa nome e sobrenome do cliente a partir da string name
  const position = userData.fullName.indexOf(' ');
  userData.firstName = userData.fullName.slice(0, position);

  if (userData.cpf === '') {
    userData.doc = userData.cnpj;
  }
  else {
    userData.doc = userData.cpf;
  }
  delete userData.cpf;
  delete userData.cnpj;

  req.session.userType = userData.type;
  req.session.firstName = userData.firstName;
  req.session.fullName = userData.fullName;
  req.session.email = userData.email;

  firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password).then((user) => {
    req.session.userUid = user.uid;
    userData.uid = user.uid;
    delete userData.password;
    User.create(userData, user.uid).then((docId) => {
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

/* ////////////////////////////////////
  BackEnd - CADASTRO NA NEWSLETTER
//////////////////////////////////// */
// router.post('/newsletter', (req, res) => {
//   const {
//     fullName,
//     mail
//   } = req.body;
//   // Separa nome e sobrenome do cliente a partir da string name
//   const position = fullName.indexOf(' ');
//   const firstName = fullName.slice(0, position);
//   firebase.firestore().collection('newsletter').add({
//     firstName,
//     fullName,
//     mail
//   })
//     .then((docRef) => {
//       console.log('Document written with ID: ', docRef.id);
//       res.redirect('/home');
//     }).catch((error) => {
//       console.log('Error ading document: ', error);
//       res.redirect('/error');
//     });
// });

/* ////////////////////////////
  BackEnd - ENVIO DE EMAIL
//////////////////////////// */
router.post('/contact', (req, res) => {
  const emailData = req.body.data;
  console.log(req.body.data);
  Email.sendEmail(emailData).then((info) => {
    console.log(info);
    res.redirect('/success');
  }).catch(err => console.log(err));
});

/* ////////////////////////////////////
  BackEnd - ENVIO DE EMAILS PARA NEWSLETTER
//////////////////////////////////// */
router.post('/newslettermail', (req, res) => {
  var clientList = firebase.firestore().collection('newsletter');
  var mailList = clientList.where('email', '==', true);
  console.log(mailList);
  res.redirect('/success');
});

module.exports = router;
