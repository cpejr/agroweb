/**
 * Commercial Middleware
 */
const Transaction = require('../../models/transaction');
const User = require('../../models/user');

module.exports = {
  hasOfferAlready: (req, res, next) => {
    const { offer } = req.body;
    User.getAllOffersByUserId(req.session.userId).then((offers) => {
      offers.forEach((object) => {
        if (object.product.name === offer.product && object.delivery === offer.delivery) {
          req.flash('danger', 'Já existe uma oferta para esse produto com esse tipo de entrega.');
          res.redirect('/offers/new');
        }
      });
      next();
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  },
  hasStock: (req, res, next) => {
    Transaction.getById(req.params.id).then((transaction) => {
      if (transaction.offer.stock < transaction.amountBought) {
        req.flash('danger', 'Tarde demais, o fornecedor não tem mais estoque para atender seu pedido.');
        res.redirect('/user');
      }
      else {
        next();
      }
    }).catch((error) => {
      console.log(error);
      req.flash('danger', 'Não foi possível encontrar essa transação.');
      res.redirect('/user');
    });
  }
};
