const express = require('express');
const firebase = require('firebase');
const Group = require('../models/group');
const Newsletter = require('../models/newsletter');
const Offer = require('../models/offer');
const Product = require('../models/product');
const User = require('../models/user');
const auth = require('./middleware/auth');

var router = express.Router();


router.get('/' (req, res) => {
    res.render('test', { title: 'Termos', layout: 'layout', termos });
  });
