var express = require('express');

var router = express.Router();


/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('Login', { title: 'Login', extraCss: 'Login', layout: 'layout' });
});

module.exports = router;
