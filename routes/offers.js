const express = require('express');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Product = require('../models/product');
const User = require('../models/user');
const auth = require('./middleware/auth');
const Dollar = require('../functions/money');

const router = express.Router();

/**
 * GET Index - Show all offers
 */
router.get('/', auth.isAdmin, (req, res) => {
  Offer.getAll().then((offers) => {
    console.log(offers);
    res.render('offers/index', { title: 'Oferta', offers });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET New - Show form to create new offer
 */
router.get('/new', auth.canSell, (req, res) => {
  const names = [];
  const queryProduct = {};
  const sortProduct = { name: 1 };
  Product.getByQuerySorted(queryProduct, sortProduct).then((products) => {
    products.forEach((product) => {
      names.push(product.name);
    });
    console.log(names);
    res.render('offers/new', { title: 'Nova Oferta', names });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * POST Create - Add new offer to DB
 */
router.post('/', (req, res) => {
  const { offer } = req.body;
  User.getById(req.session._id).then((user) => {
    offer.seller = user;
    Offer.create(offer).then((offerId) => {
      console.log(`Created new offer with id: ${offerId}`);
      if (offer.delivery !== 'Em até 48 horas') {
        const queryGroup = { productId: offer.product, delivery: offer.delivery };
        Group.getOneByQuery(queryGroup).then((group) => {
          console.log(group);
          Dollar.getUsdValue().then((dollar) => {
            if (group) {
              console.log('Compara e troca a oferta que tem o grupo');
              let offerGroupPrice = ((group.offer.price.high * 3) + (group.offer.price.average * 1)) / 4;
              let offerPrice = ((offer.price.high * 3) + (offer.price.average * 1)) / 4;
              if (group.offer.usd) {
                offerGroupPrice *= dollar;
              }
              if (offer.usd) {
                offerPrice *= dollar;
              }
              if (offerGroupPrice < offerPrice) {
                const groupData = {
                  offer: offer._id
                };
                Group.update(group._id, groupData).catch((error) => {
                  console.log(error);
                  res.redirect('/error');
                });
              }
              else if (offerGroupPrice === offerPrice) {
                if (group.offer.stock < offer.stock) {
                  const groupData = {
                    offer: offer._id
                  };
                  Group.update(group._id, groupData).catch((error) => {
                    console.log(error);
                    res.redirect('/error');
                  });
                }
              }
            }
            else {
              const newGroup = {
                amount: 0,
                offer: offerId,
                price: offer.price.high,
                productId: offer.product,
                delivery: offer.delivery
              };
              Group.create(newGroup).then((groupId) => {
                console.log(`Created new group with id: ${groupId}`);
              }).catch((error) => {
                console.log(error);
                res.redirect('/error');
              });
            }
          }).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }
      User.addOffer(req.session._id, offerId).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      res.redirect(`/offers/${offerId}`);
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Show - Show details of a offer
 */
router.get('/:id', auth.isAuthenticated, (req, res) => {
  const { userType } = req.session;
  Offer.getById(req.params.id).then((offer) => {
    if (offer) {
      // console.log(offer);
      res.render('offers/show', { title: offer.product.name, id: req.params.id, userType, ...offer });
    }
    else {
      console.log('Offer not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Edit - Show the offer edit form
 */
router.get('/:id/edit', auth.canSell, (req, res) => {
  Offer.getById(req.params.id).then((offer) => {
    if (offer) {
      console.log(offer);
      res.render('offers/edit', { title: `Editar ${offer.name}`, id: req.params.id, ...offer });
    }
    else {
      console.log('Offer not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * PUT Update - Update a offer in the database
 */
router.put('/:id', (req, res) => {
  const { offer } = req.body;
  if (offer.delivery !== 'Em até 48 horas') {
    const queryGroup = { productId: offer.product, delivery: offer.delivery };
    Group.getOneByQuery(queryGroup).then((group) => {
      console.log(group);
      Dollar.getUsdValue().then((dollar) => {
        if (group) {
          console.log('Compara e troca a oferta que tem o grupo');
          let offerGroupPrice = ((group.offer.price.high * 3) + (group.offer.price.average * 1)) / 4;
          let offerPrice = ((offer.price.high * 3) + (offer.price.average * 1)) / 4;
          if (group.offer.usd) {
            offerGroupPrice *= dollar;
          }
          if (offer.usd) {
            offerPrice *= dollar;
          }
          if (offerGroupPrice < offerPrice) {
            const groupData = {
              offer: offer._id
            };
            Group.update(group._id, groupData).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
          }
          else if (offerGroupPrice === offerPrice) {
            if (group.offer.stock < offer.stock) {
              const groupData = {
                offer: offer._id
              };
              Group.update(group._id, groupData).catch((error) => {
                console.log(error);
                res.redirect('/error');
              });
            }
          }
        }
        else {
          const newGroup = {
            amount: 0,
            offer: offer._id,
            price: offer.price.high,
            productId: offer.product,
            delivery: offer.delivery
          };
          Group.create(newGroup).then((groupId) => {
            console.log(`Created new group with id: ${groupId}`);
          }).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }
  Offer.update(req.params.id, offer).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect(`/offers/${req.params.id}`);
});

/**
 * DELETE Destroy - Removes a offer from the databse
 */
router.delete('/:id', (req, res) => {
  Offer.delete(req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/offers');
});

module.exports = router;
