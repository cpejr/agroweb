var express = require('express');
var router = express.Router();
var hbs = require('handlebars');
var nodemailer = require('nodemailer');


/* GET home page. */
router.get('/', function(req, res, next){
  res.send('respond with a resource');
});

router.get('/success', (req, res, next) => {
  res.render('success', { title: 'Email enviado com sucesso'});
});


router.post('/login',(req,res,next) => {
  const name = req.body.name;
  const email = req.body.email;
  const emailcontents = req.body.email;
  // Criamos nosso transporte
  var transporte = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sayuriyamaguchi22@gmail.com',
      pass: 'ufmg2017001923'
    }
  });

  // Criamos um template bacana para nosso e-mail, com algumas variáveis
  // para deixar o mesmo bem pessoal.
  var template = hbs.compile('' +
    '<h1>Olá {{nome}} {{sobrenome}}!</h1>' +
    '<p>É com grande prazer que venho dizer oi!</p>' +
    '');

  // Algumas configurações padrões para nossos e-mails
  var config = {
    remetente: 'sayuriyamaguchi22@gmail.com',
    assunto: 'Teste Agroweb!'
  };

  // Agora só falta uma lista de usuários para enviar
  var usuario = [
    {
      nome: 'Brenda',
      sobrenome: 'Yamaguchi',
      email: 'brendayamaguchi@cpejr.com.br'
    }
  ];

  // Criamos uma função recursiva para enviar todos os e-mails
  function enviar(){

    if(!usuario) // Se usuários for false (undefined), significa que a array já terminou
      return console.log('Acabamos de enviar!'); // O return funciona como um break

    // Passamos as variáveis para nosso template
    var html = template(usuario);

    // Hora de disparar o e-mail usando as configurações pré
    // definidas e as informações pessoas do usuário
    transporte.sendMail({
      from: config.remetente,
      to: usuario.email,
      subject: config.assunto,
      htm: html
    }, function(err){

      if(err)
        throw err;

      console.log('E-mail para %s enviado!', usuario.email);

      // Enviamos um e-mail para o próximo da fila incrementando
      // o número que recebemos nesta função
    });
  };

  // Precisamos chamar a função que criamos
  // passando o primeiro lugar da fila no array

});

module.exports = router;
