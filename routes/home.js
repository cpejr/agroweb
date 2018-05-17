var express = require('express');

var router = express.Router();


/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('home', { title: 'Home' });
});

module.exports = router;
