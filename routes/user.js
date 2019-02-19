const express = require('express');
const firebase = require('firebase');
const formidable = require('formidable');
const fs = require('fs');
const Email = require('../models/email');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET User Home page
 */
router.get('/', auth.isAuthenticated, (req, res) => {
  if (req.session.userStatus === 'Ativo' || req.session.userStatus === 'Inativo') {
    if (req.session.userStatus === 'Inativo') {
      User.update(req.session.userId, { status: 'Ativo' }).catch((error) => {
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
      console.log(req.session);
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
  User.getById(req.session.userId).then((user) => {
    if (user) {
      User.getAllOpenOrdersByUserId(req.session.userId).then((transactions) => {
        console.log(transactions);
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
  const userId = req.session.userId;
  User.getById(userId).then((user) => {
    if (user) {
      User.getAllOpenSalesByUserId(userId).then((transactions) => {
        console.log(userId);
        console.log(transactions);
        res.render('orders', { title: 'Demandas', transactions, ...req.session });
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
  User.getById(req.session.userId).then((user) => {
    if (user) {
      User.getAllOffersByUserId(req.session.userId).then((offers) => {
        res.render('offers', { title: 'Produtos oferecidos', layout: 'layout', offers, ...req.session });
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
 * POST inactive - inactive a user
 */
router.post('/inactive', auth.isAuthenticated, (req, res) => {
  User.getById(req.session.userId).then((user) => {
    Email.inactivatedUsersEmail(user).catch((error) => {
      req.flash('danger', 'Não foi possível enviar o email para o usuário inativado.');
      res.redirect('/login');
    });
  });
  const user = {
    status: 'Inativo'
  };
  User.update(req.session.userId, user).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  req.flash('success', 'Usuário inativado.');
  res.redirect('/logout');
});


/**
 * GET contact page
 */
router.get('/contact',  auth.isAuthenticated, (req, res) => {
  res.render('contact', { title: 'Contato', ...req.session });
});

/**
 * GET history - Show the user's buying history
 */
router.get('/history', auth.isAuthenticated, (req, res) => {
  User.getById(req.session.userId).then((user) => {
    if (user) {
      User.getAllTransactionsByUserId(req.session.userId).then((transactions) => {
        console.log(transactions);
        res.render('orders', { title: 'Histórico', transactions, ...req.session });
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
  const userId = req.session.userId;
  User.getById(req.params.id).then((user) => {
    if (user) {
      const franchisee = user.agreementList[0];
      User.getAgreementListById(req.session.userId).then((client) => {
        User.getContractRequestsById(req.session.userId).then((contract) => {
          console.log(userId);
          console.log(user);
          res.render('profile/index', { title: 'Perfil', id: req.params.id, layout: 'layout', user, client, franchisee, ...req.session });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error');
        });
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
  User.getById(req.session.userId).then((user) => {
    console.log(user);
    if (user) {
      res.render('profile/edit', { title: 'Editar', layout: 'layout', user, ...req.session });
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
  const userId = req.session.userId;
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
    });
    req.flash('success', 'Compra realizada.');
    res.redirect('/user');
  });
});

/**
 * PUT Update - Update a user in the database
 */
router.post('/update', auth.isAuthenticated, (req, res) => {
  const userData = req.body.user;

  // Separates the first name from the rest
  const position = userData.fullName.indexOf(' ');
  if (position > -1) {
    userData.firstName = userData.fullName.slice(0, position);
  }
  else {
    userData.firstName = userData.fullName;
  }
  User.update(req.session.userId, userData).then(() => {
    req.flash('success', 'Perfil atualizado.');
    res.redirect('/user');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/*
 * GET contract page
 */
router.get('/franchisee', auth.isAuthenticated, (req, res) => {
  User.getByQuerySorted({ type: 'Franqueado', status: 'Ativo', moreClients: true }, {}).then((users) => {
    res.render('contract', { title: 'Contrate um franqueados', layout: 'layout', users, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/*
 * GET contract request page
 */
router.get('/contractRequests', auth.isAuthenticated, (req, res) => {
  User.getContractRequestsById(req.session.userId).then((users) => {
    res.render('contractRequests', { title: 'Requisições de contrato', layout: 'layout', users, ...req.session });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/**
 * GET clients page
 */
router.get('/agreementList', auth.isAuthenticated, (req, res) => {
  User.getAgreementListById(req.session.userId).then((clients) => {
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
router.delete('/:id', auth.isAuthenticated, (req, res) => {
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
  User.getContractRequestsById(req.body.clientId).then((users) => {
    const userId = req.session.userId;
    User.addClient(req.body.clientId, userId).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
    User.addClient(userId, req.body.clientId).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
    User.increaseTotalCustomers(userId).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });

    User.getById(req.body.clientId).then((user) => {
      const userName = req.session.firstName;
      Email.contractApprovedEmail(user, userName).catch((error) => {
        req.flash('danger', 'Não foi possível enviar o email para o cliente do franqueado.');
        res.redirect('/login');
      });
    }).catch((error) => {
      req.flash('warning', 'Não foi possível encontrar usuário.');
      res.redirect('/user');
    });

    users.forEach((user) => {
      User.removeContract(user._id, req.body.clientId).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      User.removeContract(req.body.clientId, user._id).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    });
    req.flash('success', 'Contrato de franqueamento aceito. Não se esqueça de enviar o contrato para o cliente.');
    res.redirect('/user');
  }).catch((error) => {
    req.flash('warning', 'Não foi possível acessar lista de pedidos de contratos do cliente.');
    res.redirect('/user');
  });
});


/**
* POST contract - Generate Contract franchisee request
*/
router.post('/generateContractRequest', auth.isAuthenticated, (req, res) => {
  User.getAgreementListById(req.session.userId).then((client) => {
    if (client.uid) {
      req.flash('danger', 'Não é possível contratar mais de um franqueado.');
      res.redirect('/user');
    }
    else {
      const userId = req.session.userId;

      User.removeContract(req.body.franchiseeId, userId).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      User.removeContract(userId, req.body.franchiseeId).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });

      User.addContract(req.body.franchiseeId, userId).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      User.addContract(userId, req.body.franchiseeId).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
      req.flash('success', 'Solicitação enviada para o franqueado. Aguarde a resposta dele.');
      res.redirect('/user/franchisee');
    }
  });
});

/**
 * POST cancel - Cancel franchisee
 */
router.post('/cancel', auth.isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { userType } = req.session;

  const transaction = {
    status: 'Cancelado'
  };

  User.getAllQuotationsByUserId(userId).then((quotations) => {
    quotations.forEach((quotation) => {
      if (quotation.franchisee) {
        if (userType === 'Franqueado') {
          if (quotation.buyer._id === req.body.franchiseeID) {
            User.removeFromMyCart(quotation.buyer._id, quotation._id).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
            User.removeFromMyCart(quotation.franchisee._id, quotation._id).catch((error) => {
              console.log(error);
              res.redirect('/error');
            });
          }
        }
        else {
          User.removeFromMyCart(quotation.buyer._id, quotation._id).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
          User.removeFromMyCart(quotation.franchisee._id, quotation._id).catch((error) => {
            console.log(error);
            res.redirect('/error');
          });
        }
      }
      Transaction.update(quotation._id, transaction).catch((error) => {
        console.log(error);
        res.redirect('/error');
      });
    });
  });
  User.removeClient(req.body.franchiseeID, userId).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  User.removeClient(userId, req.body.franchiseeID).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  if (userType === 'Franqueado') {
    User.decreaseTotalCustomers(userId, req.body.franchiseeID).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }
  else if (userType === 'Produtor') {
    User.decreaseTotalCustomers(req.body.franchiseeID).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }
  req.flash('success', 'Franqueamento cancelado.');
  res.redirect('/user/agreementList');
});


/**
 * POST denyContract - Franchisee refuses a contract
 */
router.post('/denyContract', auth.isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  console.log(req.body.clientId);
  console.log(userId);
  User.removeContract(req.body.clientId, userId).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
  User.removeContract(userId, req.body.clientId).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });

  User.getById(req.body.clientId).then((user) => {
    const userName = req.session.firstName;
    Email.contractRepprovedEmail(user, userName).catch((error) => {
      req.flash('danger', 'Não foi possível enviar o email para o cliente recusado do franqueado.');
      res.redirect('/login');
    });
  }).catch((error) => {
    req.flash('warning', 'Não foi possível encontrar usuário.');
    res.redirect('/user');
  });
  req.flash('success', 'Pedido de fraqueamento recusado.');
  res.redirect('/user/contractRequests');
});

/**
 * POST change - Change franchisee
 */
router.post('/change', auth.isAuthenticated, (req, res) => {
  User.getAgreementListById(req.session.userId).then((client) => {
    const userId = req.session.userId;
    User.removeClient(client[0]._id, userId).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
    User.removeClient(userId, client[0]._id).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
    User.addContract(req.body.franchiseeId, userId).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
    User.addContract(userId, req.body.franchiseeId).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
    req.flash('success', 'Troca de franqueado realizada.');
    res.redirect('/user');
  });
});

/*
 * POST indication - sends a franchisee's indication email
 */
router.post('/indication', auth.isAuthenticated, (req, res) => {
  User.getById(req.session.userId).then((users) => {
    console.log(users);
    Email.indication(users).catch((error) => {
    });
    User.getByQuerySorted({ type: 'Franqueado', status: 'Ativo', moreClients: true }, {}).then((users) => {
      res.render('contract', { title: 'Contrate um franqueados', layout: 'layout', users, ...req.session });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  }).catch((error) => {
    console.log(error);
    req.flash('danger', 'Não foi possível enviar email de compra.');
    res.redirect('/error');
  });
  req.flash('success', 'Um aviso foi enviado para o administrador. Em breve, ele te retornará em seu email.');
});

/*
 * GET doubts page
 */
router.get('/doubts', auth.isAuthenticated, (req, res) => {
  res.render('doubts', { title: 'Dúvidas frequentes', layout: 'layout' , ...req.session });
});

/*
 * POST send-ticket - send the ticket to de client
 */
router.post('/send-ticket', auth.isAuthenticated, auth.canSell, (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    Transaction.getById(fields.transactionID).then((transaction) => {
      const oldpath = files.ticket.path;
      const newpath = `./tickets/${files.ticket.name}`;
      fs.rename(oldpath, newpath, (error) => {
        if (error) throw error;
        const data = {
          path: newpath,
          email: transaction.buyer.email,
          firstName: transaction.buyer.firstName,
          transactionID: fields.transactionID
        };
        Email.ticket(data).then(() => {
          req.flash('success', 'Boleto enviado');
          const transactionData = {
            status: 'Aguardando pagamento'
          };
          Transaction.update(fields.transactionID, transactionData).catch((error) => {
            req.flash('danger', 'Não foi possível atualizar o status da transação.');
            res.redirect('/error');
          });
          res.redirect('/user/sales');
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

/*
 * POST send-payment - Send the proof of payment
 */
router.post('/send-payment', auth.isAuthenticated, (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    Transaction.getById(fields.transactionID).then((transaction) => {
      const oldpath = files.payment.path;
      const newpath = `./tickets/${files.payment.name}`;
      fs.rename(oldpath, newpath, (error) => {
        if (error) throw error;
        if (req.session.userType === 'Franqueado' || req.session.userType === 'Produtor') {
          const data = {
            path: newpath,
            email: transaction.offer.seller.email,
            firstName: transaction.offer.seller.firstName,
            transactionID: fields.transactionID
          };
          Email.paymentProof(data).then(() => {
            req.flash('success', 'Comprovante de pagamento enviado');
            res.redirect('/user/orders');
            res.end();
          }).catch(() => {
            req.flash('danger', 'Não foi possível enviar o comprovante de pagamento.');
            res.redirect('/login');
          });
        }
        else {
          const data = {
            path: newpath,
            transactionID: fields.transactionID
          };
          Email.taxPaymentProof(data).then(() => {
            req.flash('success', 'Comprovante de pagamento enviado');
            res.redirect('/user/sales');
            res.end();
          }).catch(() => {
            req.flash('danger', 'Não foi possível enviar o comprovante de pagamento.');
            res.redirect('/login');
          });
        }
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error');
    });
  });
});

/*
 * GET change-password - Render the page to change the user's password
 */
router.get('/change-password', auth.isAuthenticated, (req, res) => {
  res.render('profile/change-password', { title: 'Alterar senha', ...req.session });
});

/*
 * POST change-password - Change the user's password
 */
router.post('/change-password', auth.isAuthenticated, (req, res) => {
  const { user } = req.body;
  const credential = firebase.auth.EmailAuthProvider.credential(
    req.session.email,
    user.password
  );
  firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(() => {
    firebase.auth().currentUser.updatePassword(user.newPassword).then(() => {
      req.flash('success', 'Senha alterada com sucesso');
      res.redirect('/user/edit');
    }).catch((error) => {
      console.log(error);
      switch (error.code) {
        case 'auth/weak-password':
          req.flash('danger', 'A senha fornecida é muito fraca.');
          break;
        case 'auth/requires-recent-login':
          req.flash('danger', 'É necessário se reautenticar antes de realizar essa ação');
          res.redirect('/login');
          break;
        default:
          req.flash('danger', 'Erro indefinido.');
      }
      res.redirect('/change-password');
    });
  }).catch((error) => {
    console.log(error);
    switch (error.code) {
      case 'auth/user-mismatch':
        req.flash('danger', 'A credencial não corresponde ao usuário, contate nosso suporte.');
        break;
      case 'auth/user-not-found':
        req.flash('danger', 'A credencial não corresponde à nenhum usuário, contate nosso suporte.');
        break;
      case 'auth/invalid-credential':
        req.flash('danger', 'Credencial inválida. Tente novamente ou contate nosso suporte.');
        break;
      case 'auth/invalid-email':
        req.flash('danger', 'Email inválido.');
        break;
      case 'auth/wrong-password':
        req.flash('danger', 'Senha atual incorreta.');
        break;
      default:
        req.flash('danger', 'Erro indefinido.');
    }
    res.redirect('/change-password');
  });
});

module.exports = router;
