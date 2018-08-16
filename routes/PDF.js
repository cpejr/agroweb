var express = require('express');

var router = express.Router();
var nodemailer = require('nodemailer');
var hbs = require('handlebars');
var PDFDocument = require('pdfkit');
var blobStream = require('blob-stream');
var fs = require('fs'); // file system module of Node.js

/* GET Receipt forms listing. */
router.get('/', (req, res) => {
  res.render('receipt', { title: 'PDF generator!', layout: 'layout', ...req.session });
});

router.post('/createPDF', (req, res) => {
  // const mail = req.session.email;
  const email = 'sayuriyamaguchi22@gmail.com';
  const teste = 'TESTE2'

  function writePDF(name) {
    const fileName = './budget/' + name + '.pdf';
    // Create a document
    const pdf = new PDFDocument({ size: 'LEGAL' });
    // Write PDF content
    pdf.text(req.body.name);
    // Close PDF.
    pdf.end();
    // Stream contents to a file
    pdf.pipe(fs.createWriteStream(fileName)).on('finish', () => {
      const data = fs.readFileSync(fileName);
      res.contentType('application/pdf');
      res.send(data);
    });
  }
  // Buscar no BD o email do cliente
  function sendingMail(mail, name) {
    const fileName = './budget/' + name + '.pdf';
    fs.readFile(fileName, (err, data) => {
      if (err) throw err;
      const content = 'Thanks for your preference!';

      const transporte = nodemailer.createTransport({
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

      const config = {
        from: 'admcpejr@megapool.com.br',
        to: mail,
        subject: 'Receipt',
        text: content,
        attachments: [{
          filename: name + '.pdf',
          path: 'C:/Users/sayur/Desktop/GitHub/WEB00/AgroWeb/budget/' + name + '.pdf',
          contentType: 'application/pdf'
        }]
      };

      transporte.sendMail(config, (error, info) => {
        if (error) {
          console.log(error);
        }
        else {
          console.log('Email enviado' + info.response);
        }
      });
    });
  }
  writePDF(teste);
  sendingMail(email, 'TESTE2');
});

module.exports = router;
