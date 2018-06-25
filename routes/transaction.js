const express = require('express');
const auth = require('./middleware/auth');
const Transaction = require('../models/transaction.js');
const Group = require('../models/group.js');
const Offer = require('../models/offer.js');
const User = require('../models/user.js');
const Product = require('../models/product.js');

const router = express.Router();

/**
 * GET Index - Create newTransation
 */
router.get('/', auth.isAuthenticated, (req, res) => {
// const product = {
//   name: 'TESTE2',
//   category: 'Sementes',
//   manufacturer: 'Não soube preencher esse campo',
//   description: 'Esse produto é incrívelmente perfeito',
//   unit: 'kg'
// };
//
// Product.create(product).then((newProduct) =>{
//   console.log (newProduct);
// }).then((error) =>{
//   console.log(error);
// });
  // const offer = {
  //   stock: '10',
  //   balance: '500',
  //   price: {
  //     low: 10,
  //     average: 50,
  //     high: 500
  //   },
  //   breakpoints: {
  //     low: 15,
  //     average: 50
  //   },
  //   minAmount: 36,
  //   delivery: 'em até 48 horas',
  //   seller: '5b2562e2d4d4ee20245f6bc4',
  //   product: '5b2c0bd6e9ffc144807967b0'
  // };
  //
  // Offer.create(offer).then((newOffer) => {
  //   console.log(newOffer);
  // }).catch((error) => {
  //   console.log(error);
  // });

  res.render('teste', { title: 'Efetue sua Transação!'});
});

router.post('/transaction', auth.isAuthenticated, (req, res) => {
  res.render('/success', { title: 'Sua transação foi efetuada com sucesso!'});
  const buyer = req.session._id;
  const amountBought = req.body.amountBought;

  const transactionData = {
    buyer: buyer,
    priceBought: req.body.priceBought,
    amountBought: amountBought,
    unitPrice: req.body.unitPrice,
    offer: null
  };

  console.log(transactionData);
  // Create a new transation
  Transaction.create(transactionData).then((transaction) => {
    const group = Group.getById(groupId).then(() => {
      const amountGroup = group.amount - amountBought;
      const groupData = {
        amount: amountGroup
      };
      Group.update(groupId, groupData); // update the group
      Group.deleteUser(groupId, buyer); // delete a user
    });

    const offer = Offer.getById(offerId).then(() => {
      const stockOffer = offer.stock - amountBought;
      const offerData = {
        stock: stockOffer
      };
      Offer.update(offerId, offerData); // update the offer
      User.addTransaction(offer.seller, transaction);
    });
    User.addTransaction(buyer, transaction);
  }).catch((error) => {
    console.log(error);
  });
});

module.exports = router;
