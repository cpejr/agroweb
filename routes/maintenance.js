const express = require('express');
const nodemailer = require('nodemailer');
const Newsletter = require('../models/newsletter');

const router = express.Router();

/**
 * GET Maintenance page
 */
router.get('/', (req, res) => {
  res.render('maintenance', { title: 'Manutenção', layout: 'layout' });
});

/**
 * POST maintenance/newsletter request
 */
router.post('/newsletter', (req, res) => {
  const newsletterData = req.body.newsletter;
  console.log(newsletterData);
  Newsletter.create(newsletterData).then(() => {
    res.redirect('/');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
