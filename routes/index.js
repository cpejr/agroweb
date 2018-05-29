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

router.get('/email', function (req, res, next  ){
  res.render('email', { title: 'Newsletter', layout: "layout"});
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
    res.redirect('/error');
  });
  var client_list = firebase.firestore().collection('newsletter');
  var mail_list = client_list.where("mail","==",true);
  console.log(mail_list);
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
  const name = req.body.name;
  const user_type = req.body.user_type;
  const mail = req.body.mail;
  const pass = req.body.pass;
  const store = req.body.store;
  const cpf = req.body.cpf;
  const cnpj = req.body.cnpj;
  const created = firebase.database.ServerValue.TIMESTAMP;

  //Separa nome e sobrenome do cliente a partir da string name
const position = name.indexOf(" ");
const first_name = name.slice(0, position);
const last_name = name.slice(position + 1);

const firestore = firebase.firestore();
const settings = {
  timestampsInSnapshots: true
};
firestore.settings(settings);

function sendingMail(name, mail){
  var content = "Parábens, ";
  content += name;
  content += "\n Você acaba de se cadastrar na newsletter do AgroWEB!\n";
  console.log("Texto: %s", content);
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
    to: mail,
    subject: 'Bem-Vindo ao AgroWeb!',
    text: content
  };
    // Hora de disparar o e-mail usando as configurações pré
    // definidas e as informações pessoas do usuário
  transporte.sendMail(config, function (error, info){
    if (error){
      console.log(error);
    }else{
      console.log('Email enviado' + info.response);
      console.log('Email enviado com sucesso!')
    }
  });
}

  if(user_type == 'Produtor' || user_type == 'Franqueado' || user_type == 'Revendedor'){
    if(user_type == 'Revendedor'){
      firebase.auth().createUserWithEmailAndPassword(mail,pass).catch(function(error){
        var errorCode = error.code;
        var errorMessage = error.message;
      });
        firestore.collection('users').add({
          first_name: first_name,
          last_name: last_name,
          CPF: cpf,
          mail: mail,
          user_type: user_type,
          store: store,
          created: created,
        }).then(function(docRef){
          console.log("Document written with ID: ", docRef.id);
          sendingMail(first_name, mail);
        }).catch(function(error){
          console.log("Error ading document: ", error);
        });
      }else{
        firebase.auth().createUserWithEmailAndPassword(mail,pass).catch(function(error){
          var errorCode = error.code;
          var errorMessage = error.message;
        });
          firestore.collection('users').add({
            first_name: first_name,
            last_name: last_name,
            mail: mail,
            CPF: cpf,
            user_type: user_type,
            created: created,
          }).then(function(docRef){
            console.log("Document written with ID: ", docRef.id);
            sendingMail(first_name, mail);
          }).catch(function(error){
            console.log("Error ading document: ", error);
          });
    }
  }else{
    firebase.auth().createUserWithEmailAndPassword(mail,pass).catch(function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
    });
      firestore.collection('users').add({
        first_name: first_name,
        last_name: last_name,
        mail: mail,
        CNPJ: cnpj,
        user_type: user_type,
        created: created,
      }).then(function(docRef){
        console.log("Document written with ID: ", docRef.id);
        sendingMail(first_name, mail);
      }).catch(function(error){
        console.log("Error ading document: ", error);
      });
  }
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

module.exports = router;
