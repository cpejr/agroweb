const express = require('express');
const firebase = require('firebase');
const User = require('../models/user.js');
const auth = require('./middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();


/* GET HOME - TESTES */
router.get('/', (req, res) => {
  res.render('home', { title: 'Página inicial', layout: 'layout' });
});

/* GET NEWSLETTER. - TESTES */
router.get('/newsletter', (req, res) => {
  res.render('newsletter', { title: 'Newsletter', layout: 'layout' });
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
router.get('/orders', (req, res) => {
  res.render('orders/index', { title: 'Minhas compras', layout: 'layout' });
});

router.get('/teste', auth.isAuthenticated, (req, res) => {
  User.getAllOrdersByUserId(req.session.userUid).then((orders) => {
    console.log(orders);
    res.render('success', { title: 'Sucesso', layout: 'layout' });
  }).catch((error) => {
    console.log(error);
    res.redirect('/');
  });
});

/* ////////////////////////////
  BackEnd - LOGIN
//////////////////////////// */
router.post('/login', (req, res) => {
  const userData = req.body.user;
  firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
    .then((user) => {
      User.getById(user.uid).then((currentLogged) => {
        req.session.userType = currentLogged.type;
        req.session.firstName = currentLogged.firstName;
        req.session.lastName = currentLogged.lastName;
        req.session.userUid = user.uid;
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
router.get('/logout', (req, res) => {
  firebase.auth().signOut().then(() => {
    delete req.session.userType;
    delete req.session.firstName;
    delete req.session.lastName;
    delete req.session.userUid;
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
  const created = firebase.database.ServerValue.TIMESTAMP;
  const status = 'Ativo';
  const userData = { ...req.body.user, created, status };

  // Separa nome e sobrenome do cliente a partir da string name
  const position = userData.name.indexOf(' ');
  userData.firstName = userData.name.slice(0, position);
  userData.lastName = userData.name.slice(position + 1);
  delete userData.name;

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
  req.session.lastName = userData.lastName;

  if (userData.type === 'Produtor' || userData.type === 'Franqueado' || userData.type === 'Revendedor') {
    if (userData.type === 'Revendedor') {
      firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password).then((user) => {
        req.session.userUid = user.uid;
        firebase.auth().currentUser.sendEmailVerification().then(() => {
          delete userData.password;
          User.create(userData, user.uid).then(() => {
            res.redirect('/user');
          }).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    else {
      firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password).then((user) => {
        req.session.userUid = user.uid;
        firebase.auth().currentUser.sendEmailVerification().then(() => {
          delete userData.password;
          User.create(userData, user.uid).then(() => {
            res.redirect('/user');
          }).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
  }
  else {
    firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password).then((user) => {
      req.session.userUid = user.uid;
      firebase.auth().currentUser.sendEmailVerification().then(() => {
        delete userData.password;
        User.create(userData, user.uid).then(() => {
          res.redirect('/user');
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }
});

/* ////////////////////////////////////
  BackEnd - CADASTRO NA NEWSLETTER
//////////////////////////////////// */
router.post('/newsletter', (req, res) => {
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
router.post('/contact', (req, res) => {
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
router.post('/newslettermail', (req, res) => {
  var clientList = firebase.firestore().collection('newsletter');
  var mailList = clientList.where('email', '==', true);
  console.log(mailList);
  res.redirect('/success');
});

module.exports = router;
