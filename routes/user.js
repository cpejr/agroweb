const express = require('express');
const Email = require('../models/email');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET User Home page
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  if (req.session.status === 'Ativo' || req.session.status === 'Inativo') {
    if (req.session.status === 'Inativo') {
      User.update(req.session._id, { status: 'Ativo' }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    if (req.session.userType === 'Administrador') {
      res.redirect('/admin');
    }
    else if (req.session.userType === 'Franqueado') {
      res.render('user', { title: 'Franqueado', layout: 'layoutDashboard', ...req.session });
    }
    else if (req.session.userType === 'Indústria') {
      res.render('user', { title: 'Indústria', layout: 'layoutDashboard', ...req.session });
    }
    else if (req.session.userType === 'Produtor') {
      res.render('user', { title: 'Produtor', layout: 'layoutDashboard', ...req.session });
    }
    else if (req.session.userType === 'Revendedor') {
      res.render('user', { title: 'Revendedor', layout: 'layoutDashboard', ...req.session });
    }
  }
  else {
    res.redirect('/logout');
  }
});

/**
 * GET orders - Show all user's orders
 */
router.get('/orders', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      User.getAllOpenOrdersByUserId(req.session._id).then((transactions) => {
        res.render('orders', { title: 'Minhas compras', layout: 'layout', transactions, ...req.session });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET orders - Show all user's orders
 */
router.get('/sales', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      User.getAllOpenSalesByUserId(req.session._id).then((transactions) => {
        res.render('orders', { title: 'Demandas', layout: 'layout', transactions });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET offers - Show all user's offers
 */
router.get('/offers', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      User.getAllOffersByUserId(req.session._id).then((offers) => {
        res.render('offers/index', { title: 'Produtos oferecidos', layout: 'layout', offers });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET history - Show the user's buying history
 */
router.get('/history', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      User.getAllTransactionsByUserId(req.session._id).then((transactions) => {
        console.log(transactions);
        res.render('orders', { title: 'Histórico', layout: 'layout', transactions });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Profile/index - Show all user's details
 */
router.get('/profile/:id', auth.isAuthenticated, (req, res) => {
  User.getById(req.params.id).then((user) => {
    if (user) {
      User.getAgreementListById(req.session._id).then((client) => {
        res.render('profile/index', { title: 'Perfil', id: req.params.id, layout: 'layout', user, client, ...req.session});
      }).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Edit - Show the user edit form
 */
router.get('/edit', auth.isAuthenticated, (req, res) => {
  User.getById(req.session._id).then((user) => {
    if (user) {
      res.render('profile/edit', { title: 'Editar', layout: 'layout', user });
    }
    else {
      console.log('User not found!');
      res.redirect('/user');
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * POST buy - Buy all products from myCart
 */
router.post('/buy', auth.isAuthenticated, (req, res) => {
  const userId = req.session._id;
  const transaction = {
    status: 'Aguardando boleto'
  };
  User.getAllQuotationsByUserId(userId).then((quotations) => {
    quotations.forEach((quotation) => {
      User.addTransaction(userId, quotation._id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      Email.buyEmail(quotation).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      User.addTransaction(quotation.offer.seller._id, quotation._id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      Email.sellEmail(quotation).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      Email.adminNewTransactionEmail(quotation).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      User.removeFromMyCart(userId, quotation._id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      Transaction.update(quotation._id, transaction).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    })
    req.flash('success', 'Compra realizada.');
    res.redirect('/user');
  });
});

/**
 * POST buy - Buy one products from myCart
 */
// router.post('/buy/:id', auth.isAuthenticated, (req, res) => {
//   const userId = req.session._id;
//   const transaction = {
//     status: 'Aguardando boleto'
//   };
//   User.getById(req.params.id).then((quotation) => {
//       User.addTransaction(userId, quotation._id).catch((error) => {
//         console.log(error);
//         res.redirect('/error');
//       });
//       Email.buyEmail(quotation).catch((error) => {
//         console.log(error);
//         res.redirect('/error');
//       });
//       User.addTransaction(quotation.offer.seller._id, quotation._id).catch((error) => {
//         console.log(error);
//         res.redirect('/error');
//       });
//       Email.sellEmail(quotation).catch((error) => {
//         console.log(error);
//         res.redirect('/error');
//       });
//       Email.adminNewTransactionEmail(quotation).catch((error) => {
//         console.log(error);
//         res.redirect('/error');
//       });
//       User.removeFromMyCart(userId, quotation._id).catch((error) => {
//         console.log(error);
//         res.redirect('/error');
//       });
//       Transaction.update(quotation._id, transaction).catch((error) => {
//         console.log(error);
//         res.redirect('/error');
//       });
//     })
//     req.flash('success', 'Compra realizada.');
//     res.redirect('/user/orders');
// });

/**
 * PUT Update - Update a user in the database
 */
router.post('/update', auth.isAuthenticated, (req, res) => {
  const userData = req.body.user;

  // Separates the first name from the rest
  const position = userData.fullName.indexOf(' ');
  userData.firstName = userData.fullName.slice(0, position);

  User.update(req.session._id, userData).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  req.flash('success', 'Perfil atualizado.');
  res.redirect('/user');
});

/*
 * GET contract page
 */
router.get('/franchisee', auth.isAuthenticated, (req, res) => {
  User.getAll().then((users) => {
    res.render('contract', { title: 'Contrate um franqueados', layout: 'layout', users, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET clients page
 */
 router.get('/agreementList', auth.isAuthenticated, (req, res) => {
   User.getAgreementListById(req.session._id).then((clients) => {
     if (req.session.userType === 'Produtor') {
       res.render('clients', { title: 'Meu Franqueado', layout: 'layout', clients, ...req.session });
     }
     else if (req.session.userType === 'Franqueado') {
       res.render('clients', { title: 'Meus Clientes', layout: 'layout', clients, ...req.session });
     }
   }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
 });

/**
 * DELETE Destroy - Update a user status to 'Inativo'
 */
router.delete('/:id', (req, res) => {
  User.delete(req.params.id).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  res.redirect('/logout');
});

/**
 * POST contract - Contract franchisee
 */
 router.post('/contract', auth.isAuthenticated, (req, res) => {
   User.getAgreementListById(req.session._id).then((client) => {
     if(client.uid){
       console.log("Não é possível contratar mais de um franqueado.");
     }
     else {
       const userId = req.session._id;
       User.addClient(req.body.franchiseeID, userId).catch((error) => {
         console.log(req.body.franchisee);
         res.redirect('/error');
       });
       User.addClient(userId, req.body.franchiseeID).catch((error) => {
         console.log(error);
         res.redirect('/error');
       });
       req.flash('success', 'Franqueado contratado.');
       res.redirect('/user/agreementList');
     }
   });
 });

/**
 * POST cancel - Cancel franchisee
 */
router.post('/cancel', auth.isAuthenticated, (req, res) => {
  const userId = req.session._id;
  const userType = req.session.userType;
  User.removeClient(req.body.franchiseeID, userId).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  User.removeClient(userId, req.body.franchiseeID).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  req.flash('success', 'Franqueamento cancelado.');
  res.redirect('/user/agreementList');
});

/**
 * POST change - Change franchisee
 */
 router.post('/change', auth.isAuthenticated, (req, res) => {
   User.getAgreementListById(req.session._id).then((client) => {
     const userId = req.session._id;
     User.removeClient(client[0]._id, userId).catch((error) => {
       console.log(error);
       res.redirect('/error');
     });
     User.removeClient(userId, client[0]._id).catch((error) => {
       console.log(error);
       res.redirect('/error');
     });
     User.addClient(req.body.franchiseeID, userId).catch((error) => {
       console.log(error);
       res.redirect('/error');
     });
     User.addClient(userId, req.body.franchiseeID).catch((error) => {
       console.log(error);
       res.redirect('/error');
     });
     req.flash('success', 'Troca de franqueado realizada.');
     res.redirect('/user/agreementList');
   });
 });

/**
 * GET status - Show if user is blocked or waiting
 */
router.get('/status', (req, res) => {
  User.getById(req.session._id).then((user) => {
    delete req.session.userType;
    delete req.session.firstName;
    delete req.session.fullName;
    delete req.session._id;
    delete req.session.userUid;
    delete req.session.email;
    delete req.session.status;
    res.render('status', { title: 'Aviso', layout: 'layoutError', user});
  });
});

module.exports = router;
