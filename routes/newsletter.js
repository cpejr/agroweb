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
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * POST Create - Add new newsletter to DB
 */
router.post('/', (req, res) => {
  const { newsletter } = req.body;
  Newsletter.create(newsletter).then((id) => {
    console.log(`Created new newsletter with id: ${id}`);
    res.redirect(`/user`);
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * DELETE Destroy - Removes a chem from the databse
 */
router.delete('/:id', (req, res) => {
  Newsletter.delete(req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/newsletter');
});

module.exports = router;
