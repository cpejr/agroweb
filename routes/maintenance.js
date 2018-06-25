const express = require('express');
const Newsletter = require('../models/newsletter.js');

const router = express.Router();


/* GET maintenance page. */
router.get('/', (req, res) => {
  res.render('maintenance', { title: 'Manutenção', layout: 'layout' });
});

/* POST newsletter database. */
router.post('/newsletter', (req, res) => {
  const newsletterData = req.body.newsletter;
  console.log(newsletterData);
  Newsletter.create(newsletterData).then(() => {
    res.redirect('/');
  }).catch((error) => {
    console.log(error);
  });
});

module.exports = router;
