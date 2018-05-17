var express = require('express');

var router = express.Router();


/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('signup/signup', { title: 'Cadastro', layout: "signup/layoutSignup" });
});

module.exports = router;
