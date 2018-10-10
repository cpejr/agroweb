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
  }).catch((err) => {
    console.log(err);
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
  }).catch((err) => {
    console.log(err);
    res.redirect('/error');
  });
});

/**
 * DELETE Destroy - Removes a chem from the databse
 */
router.delete('/:id', (req, res) => {
  Newsletter.delete(req.params.id).catch((err) => {
    console.log(err);
  });
  res.redirect('/newsletter');
});

module.exports = router;
