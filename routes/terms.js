const express = require('express');
const firebase = require('firebase');
const Newsletter = require('../models/newsletter');
const Product = require('../models/product');
const Offer = require('../models/offer');
const User = require('../models/user');
const auth = require('./middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  terms.getAll().then((terms) => {
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});
module.exports = router;
