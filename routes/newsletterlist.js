var express = require('express');
const Newsletter = require('../models/newsletter.js');

var router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  Newsletter.getAll().then((users) => {
    console.log(users);
    res.render('admin/newsletter', { title: 'Newsletter', users });
  }).catch((err) => {
    console.log(err);
  });
});


module.exports = router;
