const express = require('express');
const nodemailer = require('nodemailer');
const Newsletter = require('../models/newsletter');

const router = express.Router();

/**
 * GET Maintenance page
 */
router.get('/', (req, res) => {
  res.render('maintenance', { title: 'Manutenção', layout: 'layoutError' });
});

module.exports = router;
