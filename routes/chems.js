const express = require('express');
const Chem = require('../models/chem');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all chems
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  Chem.getAll().then((chems) => {
    console.log(chems);
    res.render('chems/index', { title: 'Princípios ativos', chems, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});


/**
 * GET New - Show form to create new chem
 */
router.get('/new', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  res.render('chems/new', { title: 'Novo princípio ativo', ...req.session });
});

/**
 * POST Create - Add new chem to DB
 */
router.post('/', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const { chem } = req.body;
  Chem.create(chem).then((id) => {
    console.log(`Created new chem with id: ${id}`);
    req.flash('success', 'Princípio ativo criado.');
    res.redirect('/chems');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Show - Show details of a chem
 */
router.get('/:id', auth.isAuthenticated, (req, res) => {
  Chem.getById(req.params.id).then((chem) => {
    if (chem) {
      console.log(chem);
      res.render('chems/show', { title: chem.name, id: req.params.id, ...chem, ...req.session });
    }
    else {
      console.log('Chem not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Edit - Show the chem edit form
 */
// router.get('/:id/edit', auth.isAuthenticated, auth.isAdmin, (req, res) => {
//   Chem.getById(req.params.id).then((chem) => {
//     if (chem) {
//       console.log(chem);
//       res.render('chems/edit', { title: `Editar ${chem.name}`, id: req.params.id, ...chem, ...req.session });
//     }
//     else {
//       console.log('Chem not found!');
//       res.redirect('/user');
//     }
//   }).catch((error) => {
//     console.log(error);
//     res.redirect('/error');
//   });
// });

/**
 * PUT Update - Update a chem in the database
 */
router.put('/:id', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const { chem } = req.body;
  Chem.update(req.params.id, chem).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  req.flash('success', 'Princípio ativo atualizado.');
  res.redirect('/chems');
});

/**
 * DELETE Destroy - Removes a chem from the databse
 */
router.delete('/:id', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Chem.delete(req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  req.flash('success', 'Princípio ativo desativado.');
  res.redirect('/chems');
});

module.exports = router;
