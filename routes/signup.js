var express = require('express');

var router = express.Router();


/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('signup', { title: 'Cadastro', extraCss: ['signup'], extraJS: ['signup'], layout: 'layout' });
});

module.exports = router;
