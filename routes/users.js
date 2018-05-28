var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Deu certo essa bosta');
});

router.get('/revenda', function (req, res, next){
  res.render('user', { title: 'Revenda', extraCss: ['user'], extraJS: ['navbar'], layout: "layout"});
});

router.get('/results', function (req, res, next){
  res.render('results', { title: 'Resultado', extraCss: ['results'], extraJS: ['navbar'], layout: "layout"});
});

module.exports = router;
