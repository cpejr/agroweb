/**
 * Authentication Middleware
 */
const firebase = require('firebase');

module.exports = {
  isAuthenticated: (req, res, next) => {
    const user = firebase.auth().currentUser;
    if (user !== null) {
      req.user = user;
      next();
    }
    else {
      res.redirect('/login');
    }
  },
  isAdmin: (req, res, next) => {
    const { userType } = req.session;
    if (userType === 'Administrador') {
      next();
    }
    else {
      res.redirect('/user');
    }
  },
  isProducer: (req, res, next) => {
    const { userType } = req.session;
    if (userType === 'Produtor') {
      next();
    }
    else {
      res.redirect('/user');
    }
  },
  isIndustry: (req, res, next) => {
    const { userType } = req.session;
    if (userType === 'Indústria') {
      next();
    }
    else {
      res.redirect('/user');
    }
  },
  isDealer: (req, res, next) => {
    const { userType } = req.session;
    if (userType === 'Revendedor') {
      next();
    }
    else {
      res.redirect('/user');
    }
  }
};
