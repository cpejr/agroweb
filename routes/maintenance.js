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

/**
 * POST Create - Add new newsletter to DB
 */
router.post('/', (req, res) => {
  const { newsletter } = req.body;
  Newsletter.create(newsletter).then((id) => {
    console.log(`Created new newsletter with id: ${id}`);
    req.flash('success', 'Cadastrado na newsletter com sucesso.');
    res.redirect('/maintenance');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
