const express = require('express');

const router = express.Router();
const phantom = require('phantom');

/* GET users listing. */
router.get('/', (req, res) => {
  res.render('PDF', { title: 'PDF Genarator' });
  phantom.create().then((ph) => {
    ph.createPage().then((page) => {
      page.open('http://localhost:3000/PDFgenerator').then((status) => {
        page.render('TESTE.pdf').then(() => {
          console.log('Page Rendered');
          ph.exit();
        });
      });
    });
  });
});

module.exports = router;
