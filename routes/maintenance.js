var hbs = require('handlebars');
var nodemailer = require('nodemailer');
var express = require('express');
const firebase = require('firebase');
require('firebase/firestore');

var router = express.Router();

/* GET maintenance page. */
router.get('/', function (req, res, next) {
  res.render('maintenance', { title: 'Manutenção', extraCss: 'maintenance', layout: 'layout' });
});

/* ////////////////////////////////////
  BackEnd - CADASTRO NA NEWSLETTER
////////////////////////////////////// */
router.post('/newsletter', (req, res, next) => {
  const userType = req.body.userType;
  const mail = req.body.mail;

  console.log(userType);
  console.log(mail);

  if(userType === 'Produtor') {
    firebase.firestore().collection('newsletterProductor').doc(mail).set({
    },{ merge: true})
    .then(function (){
      console.log("Document successfully written!");
      sendingMail(mail);
    }).catch(function (error){
      console.log("Error writting document: ", error);
    });
  }
  if(userType === 'Indústria'){
    firebase.firestore().collection('newsletterIndustry').doc(mail).set({
    }, { merge: true})
    .then(function(){
      console.log("Document successfully written!");
      sendingMail(mail);
    }).catch(function(error){
      console.log("Error writting document: ", error);
    });
  }
  if(userType ==='Franqueado'){
    firebase.firestore().collection('newsletterFranchisee').doc(mail).set({
    }, { merge: true})
    .then(function(){
      console.log("Document successfully written!");
      sendingMail(mail);
    }).catch(function(error){
      console.log("Error writting document: ", error);
    });
  }
  if(userType ==='Revendedor'){
    firebase.firestore().collection('newsletterDealer').doc(mail).set({
    }, { merge: true})
    .then(function(){
      console.log("Document successfully written!");
      sendingMail(mail);
    }).catch(function(error){
      console.log("Error writting document: ", error);
    });
  }

  function sendingMail(mail){
    var content = "Welcome, you are now cadastrated in our newsletter!";

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

    var config = {
      from: 'admcpejr@megapool.com.br',
      to: mail,
      subject: 'Bem-Vindo ao AgroWeb!',
      text: content
    };

    transporte.sendMail(config, function (error, info){
      if (error){
        console.log(error);
      }else{
        console.log('Email enviado' + info.response);
        console.log('Email enviado com sucesso!');
      }
    });
  }
});

module.exports = router;
