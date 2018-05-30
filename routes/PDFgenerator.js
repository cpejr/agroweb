var express = require('express');
var router = express.Router();
var phantom = require('phantom');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('PDF', { title: 'PDF Genarator'});
  phantom.create().then(function(ph) {
    ph.createPage().then(function(page) {
        page.open("http://localhost:3000/PDFgenerator").then(function(status) {
            page.render('TESTE.pdf').then(function() {
                console.log('Page Rendered');
                ph.exit();
            });
        });
    });
});

})



module.exports = router;
