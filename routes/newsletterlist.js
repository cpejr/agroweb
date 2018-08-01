var express = require('express');
const Newsletter = require('../models/newsletter');

var router = express.Router();

/**
 * GET newsletter listing
 */
router.get('/', (req, res) => {
  Newsletter.getAll().then((users) => {
    console.log(users);
    res.render('admin/newsletter', { title: 'Newsletter', layout: 'layout', users });
  }).catch((err) => {
    console.log(err);
  });
});


module.exports = router;
