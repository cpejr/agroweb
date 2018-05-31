var express = require('express');
const firebase = require('firebase');
const firestore = require('firebase/firestore');
var hbs = require('handlebars');
var nodemailer = require('nodemailer');

var router = express.Router();


/* GET HOME - TESTES */
router.get('/', (req, res, next) => {
  res.render('home', { title: 'Página inicial', layout: 'layout' });
});

/* GET NEWSLETTER. - TESTES */
router.get('/newsletter', (req, res, next) => {
  res.render('newsletter', { title: 'Newsletter', layout: 'layout' });
});
/* GET NEWPRODUCT - TESTES. */
router.get('/newproduct', (req, res, next) => {
  res.render('newproduct', { title: 'Newsproduct', layout: 'layout' });
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
  res.render('login', { title: 'Login', layout: 'layout' });
});

/* GET SIGNUP - TESTES */
router.get('/signup', (req, res, next) => {
  res.render('signup', { title: 'Cadastro', extraJS: ['signup'], layout: 'layout' });
});

router.get('/teste', (req, res, next) => {
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.firestore().collection('users').doc(user.uid).collection('myOrders')
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.data().product.get().then((product) => {
            console.log('====================================');
            console.log(product.data());
          });
          const position = doc.data().product._key.path.offset + doc.data().product._key.path.len - 1;
          const offerDoc = doc.data().product._key.path.segments[position];
          firebase.firestore().collection('offers').doc(offerDoc).get().then((offer) => {
            //console.log(offer.data());
            console.log(doc.id, ' => \n Preço = ', doc.data().price, '\n Quantidade = ', doc.data().quantity);
          });
        });
      }).catch((error) => {
        console.log('Error getting documents: ', error);
      });
    res.render('success', { title: 'Sucesso', layout: 'layout' });
  }
  else {
    console.log('Usuário não está logado');
  }
});

/* ////////////////////////////
  BackEnd - LOGIN
//////////////////////////// */
router.post('/login', (req, res, next) => {
  const mail = req.body.mail;
  const pass = req.body.pass;
  firebase.auth().signInWithEmailAndPassword(mail, pass)
    .then((user) => {
      res.redirect('/user');
    }).catch((error) => {
      res.redirect('/error');
    });
});

/* ////////////////////////////
  BackEnd - RECOVER MY PASS
//////////////////////////// */
router.post('/recoverPassword', (req, res, next) => {
  const {
    mail
  } = req.body;

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
router.post('/logout', (req, res, next) => {
  firebase.auth().signOut().then(() => {
    res.redirect('/home');
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
  const {
    name,
    userType,
    mail,
    pass,
    store,
    cpf,
    cnpj
  } = req.body;
  const created = firebase.database.ServerValue.TIMESTAMP;

  // Separa nome e sobrenome do cliente a partir da string name
  const position = name.indexOf(' ');
  const firstName = name.slice(0, position);
  const lastName = name.slice(position + 1);

  const firestore = firebase.firestore();
  const settings = {
    timestampsInSnapshots: true
  };
  firestore.settings(settings);
  console.log(userType);
  if (userType === 'Produtor' || userType === 'Franqueado' || userType === 'Revendedor') {
    if (userType === 'Revendedor') {
      firebase.auth().createUserWithEmailAndPassword(mail, pass).then((user) => {
        firebase.auth().currentUser.sendEmailVerification().then(() => {
          firestore.collection('users').doc(user.uid).set({
            firstName,
            lastName,
            cpf,
            mail,
            userType,
            store,
            created
          }).then(() => {
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
      firebase.auth().createUserWithEmailAndPassword(mail, pass).then((user) => {
        firebase.auth().currentUser.sendEmailVerification().then(() => {
          firestore.collection('users').doc(user.uid).set({
            firstName,
            lastName,
            cpf,
            mail,
            userType,
            created
          }).then(() => {
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
    firebase.auth().createUserWithEmailAndPassword(mail, pass).then((user) => {
      firebase.auth().currentUser.sendEmailVerification().then(() => {
        firestore.collection('users').doc(user.uid).set({
          firstName,
          lastName,
          cnpj,
          mail,
          userType,
          created
        }).then(() => {
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
