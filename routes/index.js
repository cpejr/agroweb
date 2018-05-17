var express = require('express');
const firebase = require('firebase');
var hbs = require('handlebars');
var nodemailer = require('nodemailer');

var router = express.Router();
const database = require('firebase/database');

var db = database;


/* GET home page. */
router.get('/', function (req, res, next  ){
  res.render('index', { title: 'Express', layout: "layout"});
});

/*/////////////////////////////
  BackEnd - LOGIN
//////////////////////////////*/
router.post('/login',(req,res,next) => {
  const mail = req.body.mail;
  const pass = req.body.pass;
  firebase.auth().signInWithEmailAndPassword(mail, pass)
  .then((user) => {
    res.redirect('/home');
  }).catch((error) => {
    res.redirect('/cadastre-se');
  });
});

/*/////////////////////////////
  BackEnd - LOGOUT
//////////////////////////////*/
router.post('/logout',(req,res,next) => {
  console.log('deivin');
  firebase.auth().signOut().then(function() {
    res.redirect('/');
  }).catch(function(error) {
    res.redirect('/error');
  });
});

/*////////////////////////////
  BackEnd - CADASTRO
//////////////////////////////*/
router.post('/signup', (req,res,next) => {
  const mail = req.body.mail;
  const pass = req.body.pass;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const user_type = req.body.user_type;
  const insc = req.body.insc;
  const created = firebase.database.ServerValue.TIMESTAMP;

  firebase.auth().createUserWithEmailAndPassword(mail,pass)
  .then((user) => {
    var newuser = {
      first_name: first_name,
      last_name: last_name,
      user_type: user_type,
      insc: insc,
      created: created,
    };
    var setDoc = db.collection('users').doc(user.uid).set(newuser);
    res.redirect('/home');
  }).catch((error) => {
    res.redirect('/error'); //criar pagina de erro
  });
});

/*////////////////////////////////////
  BackEnd - CADASTRO NA NEWSLETTER
//////////////////////////////////////*/
router.post('/newsletter/signup', (req,res,next) => {
  const name = req.body.name;
  const mail = req.body.mail;
  const entered = firebase.database.ServerValue.TIMESTAMP;

  var newNuser = {
      name: name,
      mail: mail,
      entered: entered,
    };
   db.collection('newsletter').doc().set(newNuser);
});

/*/////////////////////////////
  BackEnd - ENVIO DE EMAIL
//////////////////////////////*/
router.post('/contact',(req,res,next) => {
  const clientname = req.body.clientname;
  const clientemail = req.body.email;
  const content = req.body.content;
  const clientsubject = req.body.clientsubject;

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
  transporte.sendMail(config, function (error, info){
    if (error){
      console.log(error);
    }else{
      console.log('Email enviado' + info.response);
      res.redirect('/success');
    }
  });

  // Precisamos chamar a função que criamos
  // passando o primeiro lugar da fila no array


});

module.exports = router;
