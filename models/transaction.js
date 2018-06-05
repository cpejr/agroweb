const firebase = require('firebase');

const transactionsRef = firebase.firestore().collection('transactions');

class Transaction {
  /**
   * Get all transactions from database
   * @returns {Array} Array of transactions
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      transactionsRef.get().then((snapshot) => {
        const transactions = snapshot.docs.map((doc) => {
          const transaction = {
            id: doc.id,
            ...doc.data()
          };
          return transaction;
        });
        resolve(transactions);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all active transactions from database
   * @returns {Array} Array of transactions
   */
  static getAllActive() {
    return new Promise((resolve, reject) => {
      transactionsRef.where('status', '==', 'Ativo').get().then((snapshot) => {
        const transactions = snapshot.docs.map((doc) => {
          const transaction = {
            id: doc.id,
            ...doc.data()
          };
          return transaction;
        });
        resolve(transactions);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all inactive transactions from database
   * @returns {Array} Array of transactions
   */
  static getAllInactive() {
    return new Promise((resolve, reject) => {
      transactionsRef.where('status', '==', 'Inativo').get().then((snapshot) => {
        const transactions = snapshot.docs.map((doc) => {
          const transaction = {
            id: doc.id,
            ...doc.data()
          };
          return transaction;
        });
        resolve(transactions);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a transaction by it's id
   * @param {string} id - Transaction Id
   * @returns {Object} Transaction Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      transactionsRef.doc(id).get().then((doc) => {
        if (!doc.exists) {
          resolve(null);
        }
        else {
          resolve(doc.data());
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new transaction
   * @param {Object} transaction - Transaction Document Data
   * @returns {string} New Transaction Id
   */
  static create(transaction) {
    return new Promise((resolve, reject) => {
      transactionsRef.add(transaction).then((doc) => {
        resolve(doc.id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a transaction
   * @param {string} id - Transaction Id
   * @param {Object} transaction - Transaction Document Data
   * @returns {null}
   */
  static update(id, transaction) {
    return new Promise((resolve, reject) => {
      transactionsRef.doc(id).update(transaction).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a transaction
   * @param {string} id - Transaction Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      transactionsRef.doc(id).update({ status: 'Inativo' }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Transaction;
