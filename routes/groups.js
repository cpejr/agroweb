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
    groups.forEach((group) => {
      if (group.delivery === 'Safra' || group.delivery === 'Safrinha') {
        group.date = group.closeDate.toISOString().slice(0, 10);
        console.log(group.date);
      }
    });
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
  const { group } = req.body;
  const array = group.closeDate.split(/\D/);
  group.closeDate = new Date(array[0], --array[1], array[2]);
  Group.update(req.params.id, group).then(() => {
    res.redirect('/groups');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * DELETE Destroy - Removes a group from the databse
 */
router.delete('/:id', auth.isAuthenticated, (req, res) => {
  Group.delete(req.params.id).then(() => {
    res.redirect('/groups');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
