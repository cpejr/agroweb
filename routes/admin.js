const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const Product = require('../models/product');
const Offer = require('../models/offer');
const User = require('../models/user');
const auth = require('./middleware/auth');
const Transaction = require('../models/transaction.js');
const Dollar = require('../functions/money');
const Email = require('../models/email');

const router = express.Router();

/**
 *  GET Admin Home page
 */
router.get('/', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  res.render('admin/index', { title: 'Administrador', layout: 'layoutDashboard', ...req.session });
});

/**
 * GET Users - Show all users
 */
router.get('/users', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getByQuerySorted().then((users) => {
    console.log(users);
    res.render('admin/users', { title: 'Usuários', layout: 'layout', users, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Products - Show all products docs
 */
router.get('/products', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Product.getByQuerySorted({ status: 'Aprovado' }).then((products) => {
    console.log(products);
    res.render('admin/products', { title: 'Produtos', layout: 'layout', products, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Offers - Show all offers
 */
router.get('/offers', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Offer.getAll().then((offers) => {
    res.render('admin/offer', { title: 'Administrador', layout: 'layout', offers, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET franchiseePayment
 */
router.get('/franchiseePayment', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getByQuerySorted({ type: 'Franqueado', pendingPayment: { $ne: 0 } }, {}).then((users) => {
    res.render('admin/franchiseePayment', { title: 'Taxas dos franqueados', layout: 'layout', users, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET Transaction - Show all pending tickets
 */
router.get('/transaction', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Transaction.getByQuerySorted({ taxStatus: { $nin: ['Pagamento confirmado', 'Cancelado'] } }, {}).then((transactions) => {
    res.render('admin/transaction/index', { title: 'Administrador', layout: 'layout', transactions, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET requisitions/users - Show all users requisitions
 */
router.get('/requisitions/users', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getByQuerySorted({ status: 'Aguardando aprovação' }).then((users) => {
    res.render('admin/requisitions/users', { title: 'Requisições de cadastro', layout: 'layout', users, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET products/requisitions - Show all products requisitions
 */
router.get('/requisitions/products', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Product.getByQuerySorted({ status: 'Aguardando', active: true }).then((products) => {
    console.log(products);
    res.render('admin/requisitions/products', { title: 'Requisições de produtos', layout: 'layout', products, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * POST payFranchisse - make the franchisee payment
 */
router.post('/payFranchisee/:id', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const user = {
    pendingPayment: 0
  };
  User.update(req.params.id, user).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  User.getAllTransactionsByUserId(req.params.id).then((transactions) => {
    transactions.forEach((transaction) => {
      if (transaction.franchiseeTaxStatus === 'Pendente') {
        const status = {
          franchiseeTaxStatus: 'Pago'
        };
        Transaction.update(transaction._id, status).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
      }
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  req.flash('success', 'Pagamento do franqueado confirmado');
  res.redirect('/admin/franchiseePayment');
});

/**
 * POST updateTaxTransaction - Update the tax status of a Transaction in the database
 */
router.post('/:id/updateTaxTransaction', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const transaction = {
    taxStatus: req.body.taxStatus
  };
  Transaction.update(req.params.id, transaction).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  switch (transaction.taxStatus) {
    case 'Aguardando pagamento':
      req.flash('success', 'Status da taxa de transação atualizado para: Aguardando pagamento.');
      break;
    case 'Pagamento confirmado':
      req.flash('success', 'Status da taxa de transação atualizado para: Pagamento confirmado.');
      break;
    case 'Cancelado':
      req.flash('success', 'Status da taxa de transação atualizado para: Cancelado.');
      break;
    default:
      req.flash('success', 'Status da taxa de transação atualizado.');
  }
  res.redirect('/admin/transaction');
});

router.post('/:id/updateUserActive', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getById(req.params.id).then((user) => {
    const userData = {
      status: req.body.status
    };
    User.update(req.params.id, userData).then(() => {
      if (req.body.status === 'Ativo') {
        console.log('Enviando email para aprovar um usuário');
        Email.activatedUsersEmail(user).catch((error) => {
          req.flash('danger', 'Não foi possível enviar o email para o usuário aprovado.');
          res.redirect('/login');
        });
      }
      else if (req.body.status === 'Bloqueado') {
        console.log('Enviando email para bloquear um usuário');
        Email.blockedUsersEmail(user).catch((error) => {
          req.flash('danger', 'Não foi possível enviar o email para o usuário reprovado.');
          res.redirect('/login');
        });
      }
      else if (req.body.status === 'Inativo') {
        console.log('Enviando email para inativar um usuário');
        Email.inactivatedUsersEmail(user).catch((error) => {
          req.flash('danger', 'Não foi possível enviar o email para o usuário reprovado.');
          res.redirect('/login');
        });
      }
      switch (userData.status) {
        case 'Ativo':
          req.flash('success', 'Usuário ativado.');
          break;
        case 'Inativo':
          req.flash('success', 'Usuário inativado.');
          break;
        case 'Bloqueado':
          req.flash('success', 'Usuário bloqueado.');
          break;
        default:
          req.flash('success', 'Usuário atualizado.');
      }
      res.redirect('/admin/users');
      console.log(req.body.status);
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

router.post('/:id/requisitions/users', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  User.getById(req.params.id).then((user) => {
    const userData = {
      status: req.body.status
    };

    User.update(req.params.id, userData).then(() => {
      if (user.status === 'Aguardando aprovação') {
        if (req.body.status === 'Ativo') {
          if (user.type === 'Franqueado') {
            Email.acceptFranchisee(user).catch((error) => {
              req.flash('danger', 'Não foi possível enviar o email para o fraqueado aprovado.');
              res.redirect('/login');
            });
          }
          else {
            Email.approvedUsersEmail(user).catch((error) => {
              req.flash('danger', 'Não foi possível enviar o email para o usuário aprovado.');
              res.redirect('/login');
            });
          }
        }
        else if (req.body.status === 'Bloqueado') {
          if (user.type === 'Franqueado') {
            Email.rejectFranchisee(user).catch((error) => {
              req.flash('danger', 'Não foi possível enviar o email para o fraqueado reprovado.');
              res.redirect('/login');
            });
          }
          else {
            Email.disapprovedUsersEmail(user).catch((error) => {
              req.flash('danger', 'Não foi possível enviar o email para o usuário reprovado.');
              res.redirect('/login');
            });
          }
        }
      }
      switch (userData.status) {
        case 'Ativo':
          req.flash('success', 'Usuário ativado.');
          break;
        case 'Bloqueado':
          req.flash('success', 'Usuário bloqueado.');
          break;
        default:
          req.flash('warning', 'Usuário atualizado.');
      }
      res.redirect('/admin/requisitions/users');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

router.post('/:id/requisitions/products', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const product = {
    status: 'Aprovado'
  };
  Product.update(req.params.id, product).then(() => {
    req.flash('success', 'Produto aprovado e adicionado à plataforma.');
    res.redirect('/admin/requisitions/products');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

router.delete('/:id', (req, res) => {
  Product.delete(req.params.id).then(() => {
    req.flash('success', 'Produto recusado.');
    res.redirect('/admin/requisitions/products');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* GET Groups - Show all groups */
router.get('/groups', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Offer.getAll().then((groups) => {
    res.render('groups/index', { title: 'Grupos de Compra', layout: 'layout', groups, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* POST send-contract - Send the contract to the franchisee */
router.post('/send-contract', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    User.getById(fields.id).then((user) => {
      const oldpath = files.contract.path;
      const newpath = `./contracts/${files.contract.name}`;
      fs.rename(oldpath, newpath, (error) => {
        if (error) throw error;
        const data = {
          path: newpath,
          email: user.email,
          firstName: user.firstName
        };
        Email.franchiseeContract(data).then(() => {
          req.flash('success', 'Contrato enviado');
          res.redirect('/admin/requisitions/users');
          res.end();
        }).catch(() => {
          req.flash('danger', 'Não foi possível enviar o contrato para o franqueado.');
          res.redirect('/login');
        });
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  });
});

/* POST ptax - Updates ptax value */
router.post('/ptax', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Dollar.getPtaxValue().then((oldPtax) => {
    console.log(oldPtax);
    if (oldPtax < req.body.ptax) {
      global.risingPtax = 'true';
    }
    else {
      global.risingPtax = 'false';
    }
    Dollar.ptaxUpdate(req.body.ptax).then(() => {
      global.ptax = parseFloat(req.body.ptax).toFixed(4);
      res.redirect('/admin');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* POST dollar - Updates dollar value */
router.post('/dollar', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  Dollar.getUsdValue().then((oldUsd) => {
    console.log(oldUsd);
    if (oldUsd < req.body.usd) {
      global.rising = 'true';
    }
    else {
      global.rising = 'false';
    }
    Dollar.usdUpdate(req.body.usd).then(() => {
      global.dollar = parseFloat(req.body.usd).toFixed(4);
      res.redirect('/admin');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* POST send-tax-ticket - Send the tax ticket to the client */
router.post('/send-tax-ticket', auth.isAuthenticated, auth.isAdmin, (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    Transaction.getById(fields.transactionID).then((transaction) => {
      const oldpath = files.ticket.path;
      const newpath = `./tickets/${files.ticket.name}`;
      fs.rename(oldpath, newpath, (error) => {
        if (error) throw error;
        const data = {
          path: newpath,
          email: transaction.offer.seller.email,
          firstName: transaction.offer.seller.firstName,
          transactionID: fields.transactionID
        };
        Email.taxTicket(data).then(() => {
          req.flash('success', 'Boleto enviado');
          const transactionData = {
            taxStatus: 'Aguardando pagamento'
          };
          Transaction.update(fields.transactionID, transactionData).catch((error) => {
            req.flash('danger', 'Não foi possível atualizar o status da transação.');
            res.redirect('/error');
          });
          res.redirect('/admin/transaction');
          res.end();
        }).catch(() => {
          req.flash('danger', 'Não foi possível enviar o boleto.');
          res.redirect('/login');
        });
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  });
});

module.exports = router;
