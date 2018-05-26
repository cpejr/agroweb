var express = require('express');
const firebase = require('firebase');
const nodemailer = require('nodemailer');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Deu certo!');
});


module.exports = router;
