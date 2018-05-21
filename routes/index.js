var express = require('express');
const firebase = require('firebase');
const firestore = require('firebase/firestore');
var hbs = require('handlebars');
var nodemailer = require('nodemailer');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next  ){
  res.render('index', { title: 'Express', layout: "layout"});
});

/* GET NEWSLETTER. - TESTES */
router.get('/newsletter', function (req, res, next  ){
  res.render('newsletter', { title: 'Newsletter', layout: "layout"});
});

/* GET NEWPRODUCT - TESTES. */
router.get('/newproduct', function (req, res, next  ){
  res.render('newproduct', { title: 'Newsproduct', layout: "layout"});
});

/*/////////////////////////////
  BackEnd - LOGIN
//////////////////////////////*/
router.post('/login',(req,res,next) => {
  const mail = req.body.mail;
  const pass = req.body.pass;
  firebase.auth().signInWithEmailAndPassword(mail, pass)
  .then((user) => {
    res.redirect('/newproduct');
  }).catch((error) => {
    res.redirect('/cadastre-se');
  });
});

/*/////////////////////////////
  BackEnd - LOGOUT
//////////////////////////////*/
router.post('/logout',(req,res,next) => {
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
  const name = req.body.name;
  const user_type = req.body.user_type;
  const insc = req.body.insc;

  //Separa nome e sobrenome do cliente a partir da string name
  const position = name.indexOf(" ");
  const first_name = name.slice(0, position);
  const last_name = name.slice(position + 1);

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
    res.redirect('/newsletter');
  }).catch((error) => {
    res.redirect('/error'); //criar pagina de erro
  });
});

/* ////////////////////////////////////
  BackEnd - CADASTRO NA NEWSLETTER
//////////////////////////////////////*/
router.post('/newsletter', (req,res,next) => {
  const name = req.body.name;
  const mail = req.body.email;
  //Separa nome e sobrenome do cliente a partir da string name
  const position = name.indexOf(" ");
  const first_name = name.slice(0, position);
  const last_name = name.slice(position + 1);

  const entered = firebase.database.ServerValue.TIMESTAMP;

  firebase.firestore().collection('newsletter').add({
     first_name: first_name,
     last_name: last_name,
     mail: mail,
     entered: entered,
   })
   .then(function(docRef){
     console.log("Document written with ID: ", docRef.id);
     res.redirect('/home');
   }).catch(function(error){
     console.log("Error ading document: ", error);
     res.redirect('/error');
   });
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

/* ////////////////////////////////////
  BackEnd - CADASTRO DE NOVOS PRODUTOS
//////////////////////////////////////*/
router.post('/newproduct', (req,res,next) => {
  const name = req.body.productname;
  const category = req.body.category;

  firebase.firestore().collection('categories').doc(category).set({
     name: name,
   })
   .then(function(){
     console.log("Document written!");
     res.redirect('/home');
   }).catch(function(error){
     console.log("Error ading document: ", error);
     res.redirect('/error');
   });
});

/* ////////////////////////////////////
  BackEnd - ENVIO DE EMAILS PARA NEWSLETTER
//////////////////////////////////////*/
router.post('/newslettermail', (req,res,next) => {
  var client_list = firebase.firestore().collection('newsletter');
  var mail_list = client_list.where("email","==",true);
  console.log(mail_list);
});

module.exports = router;
