const express = require('express');
const firebase = require('firebase');
const nodemailer = require('nodemailer');
const Email = require('../models/email');
const Group = require('../models/group');
const Newsletter = require('../models/newsletter');
const Offer = require('../models/offer');
const Product = require('../models/product');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Home page
 */
router.get('/', (req, res) => {
  res.render('site/home', { title: 'Página inicial', layout: 'layoutHome' });
});

/**
 * GET Contact page
 */
router.get('/contact', (req, res) => {
  res.render('site/contact', { title: 'Contato', layout: 'layoutHome' });
});


/**
 * GET About page
 */
router.get('/about', (req, res) => {
  res.render('site/about', { title: 'Sobre', layout: 'layoutHome' });
});

/**
 * GET Partners page
 */
router.get('/partners', (req, res) => {
  res.render('site/partners', { title: 'Parceiros', layout: 'layoutHome' });
});


/**
 * GET Franchisee page
 */
router.get('/franchisee', (req, res) => {
  res.render('site/franchisee', { title: 'Trabalhe conosco', layout: 'layoutHome' });
});

/**
 * POST Contact Request
 */
router.post('/contact', (req, res) => {
  const emailData = req.body.user;
  console.log(req.body.user);
  Email.sendEmail(emailData).then((user) => {
    console.log(user);
    res.redirect('/success');
  }).catch(err => console.log(err));
});

module.exports = router;
