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
  function writePDF(name) {
    fileName = './budget/' + name + '.pdf';
    // Create a document
    const pdf = new PDFDocument({ size: 'LEGAL' });
    // Write PDF content
    pdf.text('X-minions é foda!');
    // Close PDF.
    pdf.end();
    // Stream contents to a file
    pdf.pipe(fs.createWriteStream(fileName)).on('finish', function () {
      const data = fs.readFileSync(fileName);
      res.contentType("application/pdf");
      res.send(data);
    });
  }
  //Buscar no BD o email do cliente
  function sendingMail(mail, name) {
    const fileName = './budget/' + name + '.pdf';
    fs.readFile(fileName, function (err, data) {
      if (err) throw err;
      const content = "Thanks for your preference!";

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

      transporte.sendMail(config, function (error, info) {
        if (error) {
          console.log(error);
        } else {
        console.log('Email enviado' + info.response);
        }
      });
    });
  };
  writePDF('sayuriyamaguchi22@gmail.com', 'TESTE1');
  sendingMail('sayuriyamaguchi22@gmail.com','TESTE1');
});

module.exports = router;
