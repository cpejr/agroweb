const mongoose = require('mongoose');
const User = require('./user');

const transactionSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priceBought: {
    type: Number,
    required: true
  },
  amountBought: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  status: {
    type: String,
    enum: ['Cotado', 'Aguardando boleto', 'Aguardando pagamento', 'Pagamento confirmado', 'Produto a caminho', 'Entregue', 'Cancelado'],
    default: 'Cotado'
  },
  taxStatus: {
    type: String,
    enum: ['Aguardando boleto', 'Aguardando pagamento', 'Pagamento confirmado', 'Cancelado'],
    default: 'Aguardando boleto'
  },
  franchisee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  franchiseeTaxStatus: {
    type: String,
    enum: ['Não necessário', 'Pendente', 'Pago'],
    default: 'Não necessário'
  },
  taxValue: {
    type: Number,
    default: 0
  },
  franchiseeTaxValue: {
    type: Number,
    default: 0
  },
  group: {
    type: Boolean,
    default: false
  },
  groupObject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }
}, { timestamps: true, strict: false });

const TransactionModel = mongoose.model('Transaction', transactionSchema);

class Transaction {
  /**
   * Get all Transactions from database
   * @returns {Array} Array of Transactions
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      TransactionModel.find({}).populate({
        path: 'buyer offer groupObject',
        populate: {
          path: 'seller franchisee product',
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
   * Get a Transaction by it's id
   * @param {string} id - Transaction Id
   * @returns {Object} Transaction Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      TransactionModel.findById(id).populate({
        path: 'buyer offer groupObject',
        populate: {
          path: 'seller franchisee product',
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
   * Create a new Transaction
   * @param {Object} project - Transaction Document Data
   * @returns {string} New Transaction Id
   */
  static create(transaction) {
    return new Promise((resolve, reject) => {
      TransactionModel.create(transaction).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Transaction
   * @param {string} id - Transaction Id
   * @param {Object} Transaction - Transaction Document Data
   * @returns {null}
   */
  static update(id, transaction) {
    return new Promise((resolve, reject) => {
      TransactionModel.findByIdAndUpdate(id, transaction).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a Transaction
   * @param {string} id - Transaction Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      TransactionModel.findByIdAndUpdate(id, { status: 'Cancelado' }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Transactions that match the desired query
   * @param {Object} query - Object that defines the filter
   * @param {Object} sort - Object that defines the sort method
   * @returns {Object} Transaction Document Data
   */
  static getByQuerySorted(query, sort) {
    return new Promise((resolve, reject) => {
      TransactionModel.find(query).sort(sort).populate({
        path: 'buyer offer',
        populate: {
          path: 'seller franchisee product',
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
   * Deletes all transactions from DB
   * @returns {null}
   */
  static clear() {
    return new Promise((resolve, reject) => {
      TransactionModel.deleteMany({}).then(() => {
        User.clearTransactions.then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Transaction;
