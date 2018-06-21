const mongoose = require('mongoose');

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
    enum: ['Cotado', 'Boleto pendente', 'Pagamento confirmado', 'Produto a caminho', 'Entregue', 'Cancelado'],
    default: 'Cotado'
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
      TransactionModel.find({}).populate('buyer offer').exec().then((results) => {
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
      TransactionModel.findById(id).populate('buyer offer').exec().then((result) => {
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
      TransactionModel.findByIdAndUpdate(id, transaction).catch((err) => {
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
      TransactionModel.findByIdAndDelete(id).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Transactions that match the desired status value
   * @param {string} value - Status value
   * @returns {Object} Transaction Document Data
   */
  static getAllByStatus(value) {
    return new Promise((resolve, reject) => {
      TransactionModel.find({ status: value }).populate('buyer offer').then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Transaction;
