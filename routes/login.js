var express = require('express');

var router = express.Router();


/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('login', { title: 'Cadastrar-se', extraCss: 'login', layout: 'layout' });
});

module.exports = router;
