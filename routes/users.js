
const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('Deu certo essa bosta');
});

router.get('/revenda', function (req, res, next){
  res.render('user', { title: 'Revenda', extraJS: ['navbar'], layout: "layout"});
});

router.get('/results', function (req, res, next){
  res.render('results', { title: 'Resultado', extraJS: ['navbar'], layout: "layout"});
});


module.exports = router;
