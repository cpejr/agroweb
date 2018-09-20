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
    res.render('groups/index', { title: 'Grupos', groups });
  }).catch((err) => {
    console.log(err);
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
//   }).catch((err) => {
//     console.log(err);
//     res.redirect('/groups');
//   });
// });

/**
 * GET Show - Show details of a group
 */
router.get('/:id', (req, res) => {
  Group.getById(req.params.id).then((group) => {
    if (group) {
      console.log(group);
      res.render('groups/show', { title: group.name, id: req.params.id, ...group });
    }
    else {
      console.log('Group not found!');
      res.redirect('/home');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/groups');
  });
});

/**
 * PUT Update - Update a group in the database
 */
router.put('/:id', (req, res) => {
  const group = req.body.group;
  Group.update(req.params.id, group).catch((err) => {
    console.log(err);
  });
  res.redirect(`/groups/${req.params.id}`);
});

/**
 * DELETE Destroy - Removes a group from the databse
 */
router.delete('/:id', (req, res) => {
  Group.delete(req.params.id).catch((err) => {
    console.log(err);
  });
  res.redirect('/groups');
});

module.exports = router;
