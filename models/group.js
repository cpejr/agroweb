const mongoose = require('mongoose');
const Transaction = require('./transaction');

const groupSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  productId: {
    type: String,
    required: true
  },
  delivery: {
    type: String,
    enum: ['31 dias', 'Safra', 'Safrinha'],
    required: true
  },
  rising: {
    type: Boolean,
    default: false
  },
  closeDate: Date,
  date: String
}, { timestamps: true, strict: false });

const GroupModel = mongoose.model('Group', groupSchema);

class Group {
  /**
   * Get all Groups from database
   * @returns {Array} Array of Groups
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      GroupModel.find({}).populate({
        path: 'users offer',
        populate: {
          path: 'seller product',
          populate: { path: 'chem' }
        }
      }).exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a Group by it's id
   * @param {string} id - Group Id
   * @returns {Object} Group Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      GroupModel.findById(id).populate({
        path: 'users offer',
        populate: {
          path: 'seller product',
          populate: { path: 'chem' }
        }
      }).exec().then((result) => {
        resolve(result.toObject());
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new Group
   * @param {Object} group - Group Document Data
   * @returns {string} New Group Id
   */
  static create(group) {
    return new Promise((resolve, reject) => {
      GroupModel.create(group).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Group
   * @param {string} id - Group Id
   * @param {Object} Group - Group Document Data
   * @returns {null}
   */
  static update(id, group) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndUpdate(id, group).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a Group
   * @param {string} id - Group Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndDelete(id).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Add a new User
   * @param {string} id - Group Id
   * @param {string} user - User Id
   * @returns {null}
   */
  static addUser(id, user) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndUpdate(id, { $push: { users: user } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a User
   * @param {string} id - Group Id
   * @param {string} user - User Id
   * @returns {null}
   */
  static removeUser(id, user) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndUpdate(id, { $pull: { users: user } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Add a new transaction
   * @param {string} id - Group Id
   * @param {string} transaction - Transaction Id
   * @returns {null}
   */
  static addTransaction(id, transaction) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndUpdate(id, { $push: { transactions: transaction } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a transaction
   * @param {string} id - Group Id
   * @param {string} transaction - Transaction Id
   * @returns {null}
   */
  static removeTransaction(id, transaction) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndUpdate(id, { $pull: { transactions: transaction } }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all transactions from a group
   * @param {string} id - Group id
   * @returns {Array} - Array of transactions
   */
  static getAllTransactions(id) {
    return new Promise((resolve, reject) => {
      GroupModel.findById(id).populate({
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
   * Update all transactions
   * @param {string} id - Group id
   * @returns {Array} - Array of transactions
   */
  static updateAllTransactions(id) {
    return new Promise((resolve, reject) => {
      GroupModel.findById(id).populate({
        path: 'transactions offer',
        populate: {
          path: 'buyer offer',
          populate: {
            path: 'seller product',
            populate: { path: 'chem' }
          }
        }
      }).exec().then((result) => {
        result.transactions.forEach((transaction) => {
          let unitPrice = result.unitPrice;
          const priceBought = parseFloat((unitPrice * transaction.amountBought).toFixed(2));
          Transaction.update(transaction._id, { unitPrice, priceBought, offer: result.offer }).catch((err) => {
            reject(err);
          });
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Groups that match the desired query
   * @param {Object} query - Object that defines the filter
   * @param {Object} sort - Object that defines the sort method
   * @returns {Object} Group Document Data
   */
  static getByQuerySorted(query, sort) {
    return new Promise((resolve, reject) => {
      GroupModel.find(query).sort(sort).populate({
        path: 'users offer',
        populate: {
          path: 'seller product',
          populate: { path: 'chem' }
        }
      }).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a Group that match the desired query
   * @param {Object} query - Object that defines the filter
   * @returns {Object} Group Document Data
   */
  static getOneByQuery(query) {
    return new Promise((resolve, reject) => {
      GroupModel.findOne(query).populate({
        path: 'users offer',
        populate: {
          path: 'seller product',
          populate: { path: 'chem' }
        }
      }).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Deletes all groups from DB
   * @returns {null}
   */
  static clear() {
    return new Promise((resolve, reject) => {
      GroupModel.deleteMany({}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Group;
