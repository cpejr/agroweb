const express = require('express');
const Offer = require('../models/group.js');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all groups
 */
router.get('/', (req, res) => {
  Offer.getAll('modelo').then((groups) => {
    console.log(groups);
    res.render('groups/index', { title: 'Groups', groups });
  }).catch((err) => {
    console.log(err);
  });
});

module.exports = router;
