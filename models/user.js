const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  fullName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  doc: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Administrador', 'Indústria', 'Revendedor', 'Franqueado', 'Produtor']
  },
  address: {
    cep: Number,
    street: String,
    number: Number,
    city: String,
    state: String
  },
  store: {
    type: Boolean,
    default: false
  },
  moreClients: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Inativo', 'Bloqueado', 'Aguardando aprovação', 'Ativo'],
    default: 'Aguardando aprovação',
    required: true
  },
  agreementList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  myCart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  offers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  phone: Number,
  cellphone: Number,
  fantasyName: String,
  secondaryEmail: String,
  responsible: {
    name: String,
    phone: Number,
    cellphone: Number
  },
  delivery: {
    stock: String,
    maxDistance: Number,
    dealer: String,
    groups: String,
    repechage: String,
    fractional: String
  },
  logistics: {
    phone: Number,
    email: String
  },
  headquarter: String,
  regionalResponsible: String,
  whereIsStock: String,
  interestedStates: String,
  activities: String,
  actualCustomers: String,
  possibleCustomers: String,
  totalCustomers: String,
  area: Number,
  whyIsMegapoolImportant: String,
  farm: {
    name: String,
    distanceToCity: Number,
    deliveryScript: String,
    area: Number,
    soy: Number,
    corn: Number,
    cotton: Number,
    otherCultivations: Number
  },
  wpp: Boolean,
  stateRegistration: Number
}, { timestamps: true, static: false });

const UserModel = mongoose.model('User', userSchema);

class User {
  /**
   * Get all Users from database
   * @returns {Array} Array of Users
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      UserModel.find({}).exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a User by it's id
   * @param {string} id - User Id
   * @returns {Object} - User Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new User
   * @param {Object} user - User Document Data
   * @returns {string} - New User Id
   */
  static create(user) {
    return new Promise((resolve, reject) => {
      UserModel.create(user).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a User
   * @param {string} id - User Id
   * @param {Object} User - User Document Data
   * @returns {null}
   */
  static update(id, user) {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(id, user).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a User
   * @param {string} id - User Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(id, { status: 'Inativo' }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a User by it's uid
   * @param {string} id - User Uid
   * @returns {Object} - User Document Data
   */
  static getByUid(id) {
    return new Promise((resolve, reject) => {
      UserModel.findOne({ uid: id }).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Add a transaction
   * @param {string} id - User Id
   * @param {string} transaction - Transaction Id
   * @returns {null}
   */
  static addTransaction(id, transaction) {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(id, { $push: { transactions: transaction } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Remove a transaction
   * @param {string} id - User Id
   * @param {string} transaction - Transaction Id
   * @returns {null}
   */
  static removeTransaction(id, transaction) {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(id, { $pull: { transactions: transaction } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Add to myCart
   * @param {string} id - User Id
   * @param {string} transaction - Transaction Id
   * @returns {null}
   */
  static addToMyCart(id, transaction) {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(id, { $push: { myCart: transaction } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Remove from myCart
   * @param {string} id - User Id
   * @param {string} transaction - Transaction Id
   * @returns {null}
   */
  static removeFromMyCart(id, transaction) {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(id, { $pull: { myCart: transaction } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Add offer
   * @param {string} id - User Id
   * @param {string} offer - Offer Id
   * @returns {null}
   */
  static addOffer(id, offer) {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(id, { $push: { offers: offer } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Remove from offers
   * @param {string} id - User Id
   * @param {string} offer - Offer Id
   * @returns {null}
   */
  static removeOffer(id, offer) {
    return new Promise((resolve, reject) => {
      UserModel.findByIdAndUpdate(id, { $pull: { offers: offer } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all transactions from a user by its id
   * @param {string} id - User uid
   * @returns {Array} - Array of transactions
   */
  static getAllTransactionsByUserId(id) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id).populate({
        path: 'transactions',
        populate: {
          path: 'buyer offer',
          populate: {
            path: 'seller product',
            populate: { path: 'chem' }
          }
        }
      }).exec().then((result) => {
        resolve(result.transactions);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all quotations from a user by its uid
   * @param {string} id - User uid
   * @returns {Array} - Array of transactions
   */
  static getAllQuotationsByUserId(id) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id).populate({
        path: 'myCart',
        populate: {
          path: 'buyer offer',
          populate: {
            path: 'seller product',
            populate: { path: 'chem' }
          }
        }
      }).exec().then((result) => {
        resolve(result.myCart);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all open transactions from a user by its id
   * @param {string} id - User uid
   * @returns {Array} - Array of transactions
   */
  static getAllOpenTransactionsByUserId(id) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id).populate({
        path: 'transactions',
        match: { status: { $nin: ['Cancelado', 'Entregue'] } },
        populate: {
          path: 'buyer offer',
          populate: {
            path: 'seller product',
            populate: { path: 'chem' }
          }
        }
      }).exec().then((result) => {
        resolve(result.transactions);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all offers from a user by its id
   * @param {string} id - User uid
   * @returns {Array} - Array of offers
   */
  static getAllOffersByUserId(id) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id).populate({
        path: 'offers',
        populate: {
          path: 'product',
          populate: { path: 'chem' }
        }
      }).exec().then((result) => {
        resolve(result.offers);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all clients from a franchisee by its id
   * @param {string} id - User uid
   * @returns {Array} - Array of users
   */
  static getAllClientsByUserId(id) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id).populate({ path: 'agreementList' }).exec().then((result) => {
        resolve(result.offers);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Users that match the desired query
   * @param {Object} query - Object that defines the filter
   * @param {Object} sort - Object that defines the sort method
   * @returns {Object} User Document Data
   */
  static getByQuerySorted(query, sort) {
    return new Promise((resolve, reject) => {
      UserModel.find(query).sort(sort).populate().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = User;
