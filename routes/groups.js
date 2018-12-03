const express = require('express');
const Group = require('../models/group');
const Offer = require('../models/offer');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all groups
 */
router.get('/', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Group.getAll().then((groups) => {
    console.log(groups);
    res.render('groups/index', { title: 'Grupos de compras', groups });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

// /**
//  * POST Create - Add new group to DB
//  */
// router.post('/', (req, res) => {
//   const { group } = req.body;
//   Group.create(group).then((id) => {
//     console.log(`Created new group with id: ${id}`);
//     res.redirect(`/groups/${id}`);
//   }).catch((error) => {
//   console.log(error);
//   res.redirect('/error');
// });
// });

/**
 * GET Show - Show details of a group
 */
router.get('/:id', auth.isAuthenticated, (req, res) => {
  Group.getById(req.params.id).then((group) => {
    if (group) {
      console.log(group);
      res.render('groups/show', { title: group.name, id: req.params.id, ...group });
    }
    else {
      console.log('Group not found!');
      res.redirect('/home');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * PUT Update - Update a group in the database
 */
router.put('/:id', auth.isAuthenticated, (req, res) => {
  const group = req.body.group;
  Group.update(req.params.id, group).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect(`/groups/${req.params.id}`);
});

/**
 * DELETE Destroy - Removes a group from the databse
 */
router.delete('/:id', auth.isAuthenticated, (req, res) => {
  Group.delete(req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/groups');
});

module.exports = router;
