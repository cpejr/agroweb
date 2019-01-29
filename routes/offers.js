const express = require('express');
const Group = require('../models/group');
const Offer = require('../models/offer');
const Product = require('../models/product');
const User = require('../models/user');
const auth = require('./middleware/auth');
const config = require('../docs/config.json');

const router = express.Router();

/**
 * GET Index - Show all offers
 */
router.get('/', auth.isAdmin, (req, res) => {
  Offer.getAll().then((offers) => {
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
  const { userType } = req.session;
  res.render('offers/new', { title: 'Nova Oferta', userType });
});

/**
 * POST Create - Add new offer to DB
 */
router.post('/', (req, res) => {
  const { dollar } = global;
  const { offer } = req.body;
  console.log(offer);
  User.getAllOffersByUserId(req.session._id).then((offers) => {
    offers.forEach((object) => {
      if (object.product.name === offer.product && object.delivery === offer.delivery) {
        req.flash('danger', 'Já existe uma oferta para esse produto com esse tipo de entrega.');
        res.redirect('/offers/new');
        return;
      }
    });
    if (offer.price.mega) {
      offer.price.low = offer.price.mega;
      offer.price.average = offer.price.mega;
      offer.price.high = offer.price.mega;
      delete offer.price.mega;
    }
    console.log(offer.breakpoints.low, typeof (offer.breakpoints.low));
    console.log(offer.breakpoints.average, typeof (offer.breakpoints.average));
    if (parseInt(offer.breakpoints.low, 10) > parseInt(offer.breakpoints.average, 10)) {
      const today = new Date();
      const cropDate = config.development.date.crop;
      const smallCropDate = config.development.date.smallCrop;

      const crop = new Date(today);
      crop.setDate(Number(cropDate.slice(0, 2)));
      crop.setMonth(Number(cropDate.slice(-2)) - 1);

      const smallCrop = new Date(today);
      smallCrop.setDate(Number(smallCropDate.slice(0, 2)));
      smallCrop.setMonth(Number(smallCropDate.slice(-2)) - 1);

      const cropCloseDate = new Date(crop);
      cropCloseDate.setDate(cropCloseDate.getDate() - 15);

      const smallCropCloseDate = new Date(smallCrop);
      smallCropCloseDate.setDate(smallCropCloseDate.getDate() - 15);

      if (today === crop) {
        cropCloseDate.setFullYear(crop.getFullYear() + 1);
      }

      if (today === smallCrop) {
        smallCropCloseDate.setFullYear(crop.getFullYear() + 1);
      }
      User.getById(req.session._id).then((user) => {
        offer.seller = user;
        Product.getByQuerySorted({ name: offer.product }, {}).then((product) => {
          offer.product = product[0]._id;
          Offer.create(offer).then((offerId) => {
            if (offer.delivery !== '48 horas' && !offer.megaOpportunity) {
              const queryGroup = { productId: offer.product, delivery: offer.delivery };
              Group.getOneByQuery(queryGroup).then((group) => {
                console.log(group);
                if (group) {
                  const groupData = {};
                  console.log('Compares and changes the groups offer');
                  let offerGroupPrice = ((group.offer.price.high * 3) + (group.offer.price.average * 1)) / 4;
                  let offerPrice = ((offer.price.high * 3) + (offer.price.average * 1)) / 4;
                  if (group.offer.usd) {
                    offerGroupPrice *= dollar;
                  }
                  if (offer.usd) {
                    offerPrice *= dollar;
                  }
                  if (offerGroupPrice > offerPrice) {
                    groupData.offer = offer._id;
                    if (group.amount < offer.breakpoints.average) {
                      groupData.unitPrice = offer.price.high;
                    }
                    else if (group.amount >= offer.breakpoints.average && group.amount < offer.breakpoints.low) {
                      groupData.unitPrice = offer.price.average;
                    }
                    else {
                      groupData.unitPrice = offer.price.low;
                    }
                  }
                  else if (offerGroupPrice === offerPrice) {
                    if (group.offer.stock < offer.stock) {
                      groupData.offer = offer._id;
                      if (group.amount < offer.breakpoints.average) {
                        groupData.unitPrice = offer.price.high;
                      }
                      else if (group.amount >= offer.breakpoints.average && group.amount < offer.breakpoints.low) {
                        groupData.unitPrice = offer.price.average;
                      }
                      else {
                        groupData.unitPrice = offer.price.low;
                      }
                    }
                  }
                  Group.update(group._id, groupData).catch((error) => {
                    console.log(error);
                    res.redirect('/error');
                  });
                }
                else {
                  const newGroup = {
                    amount: 0,
                    offer: offerId,
                    price: offer.price.high,
                    productId: offer.product,
                    delivery: offer.delivery
                  };
                  if (newGroup.delivery === 'Safra') {
                    newGroup.closeDate = cropCloseDate;
                  }
                  if (newGroup.delivery === 'Safrinha') {
                    newGroup.closeDate = smallCropCloseDate;
                  }
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
            }
            User.addOffer(req.session._id, offerId).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            req.flash('success', 'Oferta criada com sucesso.');
            res.redirect(`/offers/${offerId}`);
          }).catch((error) => {
            console.log(error);
            req.flash('danger', 'Não foi possivel criar a oferta. Tente novamente');
            res.redirect('new');
          });
        }).catch((error) => {
          console.log(error);
          req.flash('danger', 'O produto escolhido não existe.');
          res.redirect('new');
        });
      }).catch((error) => {
        console.log(error);
        req.flash('danger', 'Faça seu login novamente.');
        res.redirect('/login');
      });
    }
    else {
      req.flash('danger', 'O campo que muda para valor médio deve ser menor do que o campo que muda para valor baixo.');
      res.redirect('/offers/new');
    }
  }).catch((error) => {
    console.log(error);
    req.flash('danger', 'Não foi possível recuperar as ofertas desse usuário');
    res.redirect('/offers/new');
  });
});

/**
 * GET Show - Show details of a offer
 */
router.get('/:id', auth.isAuthenticated, (req, res) => {
  const { userType } = req.session;
  const userId = req.session._id;
  let myOffer = 0;
  let hasStock = 1;

  User.getAgreementListById(req.session._id).then((clients) => {
    Offer.getById(req.params.id).then((offer) => {
      if (userId == offer.seller._id) {
        myOffer = 1;
      }

      if (offer.stock < offer.minAmount) {
        hasStock = 0;
      }

      if (offer) {
        console.log(myOffer);
        const chems = offer.product.chems;
        res.render('offers/show', { title: offer.product.name, id: req.params.id, userType, myOffer, hasStock, chems, clients, ...offer });
      }
      else {
        console.log('Offer not found!');
        res.redirect('/user');
      }
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
 * GET Edit - Show the offer edit form
 */
router.get('/:id/edit', auth.canSell, (req, res) => {
  const { userType } = req.session;
  Offer.getById(req.params.id).then((offer) => {
    if (offer) {
      console.log(offer);
      res.render('offers/edit', { title: `Editar ${offer.product.name}`, id: req.params.id, userType, ...offer });
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
  const { dollar } = global;
  const { offer } = req.body;
  console.log(offer);
  Product.getByQuerySorted({ name: offer.product }, {}).then((product) => {
    offer.product = product[0]._id;
    if (offer.delivery !== '48 horas' && !offer.megaOpportunity) {
      const queryGroup = { productId: offer.product, delivery: offer.delivery };
      Group.getOneByQuery(queryGroup).then((group) => {
        console.log(group);
        if (group) {
          const groupData = {};
          console.log('Compares and changes the groups offer');
          let offerGroupPrice = ((group.offer.price.high * 3) + (group.offer.price.average * 1)) / 4;
          let offerPrice = ((offer.price.high * 3) + (offer.price.average * 1)) / 4;
          if (group.offer.usd) {
            offerGroupPrice *= dollar;
          }
          if (offer.usd) {
            offerPrice *= dollar;
          }
          if (offerGroupPrice > offerPrice) {
            groupData.offer = offer._id;
            if (group.amount < offer.breakpoints.average) {
              groupData.unitPrice = offer.price.high;
            }
            else if (group.amount >= offer.breakpoints.average && group.amount < offer.breakpoints.low) {
              groupData.unitPrice = offer.price.average;
            }
            else {
              groupData.unitPrice = offer.price.low;
            }
          }
          else if (offerGroupPrice === offerPrice) {
            if (group.offer.stock < offer.stock) {
              groupData.offer = offer._id;
              if (group.amount < offer.breakpoints.average) {
                groupData.unitPrice = offer.price.high;
              }
              else if (group.amount >= offer.breakpoints.average && group.amount < offer.breakpoints.low) {
                groupData.unitPrice = offer.price.average;
              }
              else {
                groupData.unitPrice = offer.price.low;
              }
            }
          }
          Group.update(group._id, groupData).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
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
    }
    Offer.update(req.params.id, offer).then(() => {
      req.flash('success', 'Oferta editada com sucesso.');
      res.redirect(`/offers/${req.params.id}`);
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
 * POST Active - Active a offer from the databse
 */
router.post('/active/:id', (req, res) => {
  Offer.active(req.params.id).then(() => {
    req.flash('success', 'Oferta ativada.');
    if (req.session.userType === 'Administrador') {
      res.redirect('/admin/offers');
    }
    else {
      res.redirect('/user/offers');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * DELETE Destroy - Removes a offer from the databse
 */
router.delete('/:id', (req, res) => {
  Offer.delete(req.params.id).then(() => {
    req.flash('success', 'Oferta inativada.');
    if (req.session.userType === 'Administrador') {
      res.redirect('/admin/offers');
    }
    else {
      res.redirect('/user/offers');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

module.exports = router;
