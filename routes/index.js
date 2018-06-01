const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const auth = require('./middleware/auth');
const nodemailer = require('nodemailer');

const firestore = firebase.firestore();
const router = express.Router();


/* GET HOME - TESTES */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Página inicial', layout: 'layout' });
});

/* GET NEWSLETTER. - TESTES */
router.get('/newsletter', (req, res, next) => {
  res.render('newsletter', { title: 'Newsletter', layout: 'layout' });
});

/* GET FORGOTPASSWORD - TESTES */
router.get('/forgotPassword', (req, res, next) => {
  res.render('forgotPassword', { title: 'Esqueci minha senha', layout: 'layout' });
});

/* GET SUCCESS - TESTES */
router.get('/success', (req, res, next) => {
  res.render('success', { title: 'Sucesso', layout: 'layout' });
});

/* GET LOGIN - TESTES */
router.get('/login', (req, res, next) => {
  if ('userType' in req.session) {
    if (req.session.userType === 'admin') {
      res.redirect('/admin');
    }
    else {
      res.redirect('/user');
    }
  }
  res.render('login', { title: 'Login', layout: 'layout' });
});

/* GET SIGNUP - TESTES */
router.get('/signup', (req, res, next) => {
  res.render('signup', { title: 'Cadastro', layout: 'layout' });
});

/* ////////////////////////////
  BackEnd - LOGIN
//////////////////////////// */
router.post('/login', (req, res, next) => {
  const { email, password } = req.body.user;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
      User.getById(user.uid).then((currentLogged) => {
        req.session.userType = currentLogged.userType;
        req.session.firstName = currentLogged.firstName;
        if (req.session.userType === 'admin') {
          res.redirect('/admin');
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

/* ////////////////////////////
  BackEnd - RECOVER MY PASS
//////////////////////////// */
router.post('/recoverPassword', (req, res, next) => {
  const { mail } = req.body;
  firebase.auth().sendPasswordResetEmail(mail).then(() => {
    res.redirect('/success');
  }).catch((error) => {
    res.redirect('/error');
  });
  const clientList = firebase.firestore().collection('newsletter');
  const mailList = clientList.where('mail', '==', true);
  console.log(mailList);
});

/* ////////////////////////////
  BackEnd - LOGOUT
//////////////////////////// */
router.get('/logout', (req, res, next) => {
  firebase.auth().signOut().then(() => {
    delete req.session.userType;
    delete req.session.firstName;
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
router.post('/signup', (req, res, next) => {
  const { userData } = req.body.user;
  const created = firebase.database.ServerValue.TIMESTAMP;

  // Separa nome e sobrenome do cliente a partir da string name
  const position = userData.name.indexOf(' ');
  userData.firstName = userData.name.slice(0, position);
  userData.lastName = userData.name.slice(position + 1);
  let index = userData.indexOf(userData.name);
  userData.splice(index, 1);
  if (userData.userType === 'Produtor' || userData.userType === 'Franqueado' || userData.userType === 'Revendedor') {
    if (userData.userType === 'Revendedor') {
      firebase.auth().createUserWithEmailAndPassword(userData.mail, userData.pass).then((user) => {
        firebase.auth().currentUser.sendEmailVerification().then(() => {
          index = userData.indexOf(userData.cnpj);
          userData.splice(index, 1);
          firestore.collection('users').doc(user.uid).set(userData).then(() => {
            res.redirect('/user');
          }).catch((error) => {
            res.redirect('/error');
          });
        }).catch((error) => {
          res.redirect('/error');
        });
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        res.redirect('/error');
      });
    }
    else {
      firebase.auth().createUserWithEmailAndPassword(userData.mail, userData.pass).then((user) => {
        firebase.auth().currentUser.sendEmailVerification().then(() => {
          index = userData.indexOf(userData.cnpj);
          userData.splice(index, 1);
          firestore.collection('users').doc(user.uid).set(userData).then(() => {
            res.redirect('/user');
          }).catch((error) => {
            res.redirect('/error');
          });
        }).catch((error) => {
          res.redirect('/error');
        });
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        res.redirect('/error');
      });
    }
  }
  else {
    firebase.auth().createUserWithEmailAndPassword(userData.mail, userData.pass).then((user) => {
      firebase.auth().currentUser.sendEmailVerification().then(() => {
        index = userData.indexOf(userData.cpf);
        userData.splice(index, 1);
        firestore.collection('users').doc(user.uid).set(userData).then(() => {
          res.redirect('/user');
        }).catch((error) => {
          res.redirect('/error');
        });
      }).catch((error) => {
        res.redirect('/error');
      });
    }).catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      res.redirect('/error');
    });
  }
});

/* ////////////////////////////////////
  BackEnd - CADASTRO NA NEWSLETTER
//////////////////////////////////// */
router.post('/newsletter', (req, res, next) => {
  const {
    name,
    mail
  } = req.body;
  // Separa nome e sobrenome do cliente a partir da string name
  const position = name.indexOf(' ');
  const firstName = name.slice(0, position);
  const lastName = name.slice(position + 1);

  const entered = firebase.database.ServerValue.TIMESTAMP;

  firebase.firestore().collection('newsletter').add({
    firstName,
    lastName,
    mail,
    entered
  })
    .then((docRef) => {
      console.log('Document written with ID: ', docRef.id);
      res.redirect('/home');
    }).catch((error) => {
      console.log('Error ading document: ', error);
      res.redirect('/error');
    });
});

/* ////////////////////////////
  BackEnd - ENVIO DE EMAIL
//////////////////////////// */
router.post('/contact', (req, res, next) => {
  const {
    clientname,
    email: clientemail,
    content,
    clientsubject
  } = req.body;

  var transporte = nodemailer.createTransport({
    host: 'mail.megapool.com.br',
    port: '587',
    secure: false,
    auth: {
      user: 'admcpejr@megapool.com.br',
      pass: 'Cpejr@2018'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  // Algumas configurações padrões para nossos e-mails
  var config = {
    from: 'admcpejr@megapool.com.br',
    to: clientemail,
    subject: clientsubject,
    text: content
  };
    // Hora de disparar o e-mail usando as configurações pré
    // definidas e as informações pessoas do usuário
  transporte.sendMail(config, (error, info) => {
    if (error) {
      console.log(error);
    }
    else {
      console.log(`Email enviado ${info.response}`);
      res.redirect('/success');
    }
  });

  // Precisamos chamar a função que criamos
  // passando o primeiro lugar da fila no array
});

/* ////////////////////////////////////
  BackEnd - ENVIO DE EMAILS PARA NEWSLETTER
//////////////////////////////////// */
router.post('/newslettermail', (req, res, next) => {
  var clientList = firebase.firestore().collection('newsletter');
  var mailList = clientList.where('email', '==', true);
  console.log(mailList);
});

module.exports = router;
