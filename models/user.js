const firebase = require('firebase');

const usersRef = firebase.firestore().collection('users');

class User {
  /**
   * Get all users from database
   * @returns {Array} Array of users
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      usersRef.get().then((snapshot) => {
        const users = snapshot.docs.map((doc) => {
          const user = {
            id: doc.id,
            ...doc.data()
          };
          return user;
        });
        resolve(users);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all active users from database
   * @returns {Array} Array of users
   */
  static getAllActive() {
    return new Promise((resolve, reject) => {
      usersRef.where('status', '==', 'Ativo').get().then((snapshot) => {
        const users = snapshot.docs.map((doc) => {
          const user = {
            id: doc.id,
            ...doc.data()
          };
          return user;
        });
        resolve(users);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all inactive users from database
   * @returns {Array} Array of users
   */
  static getAllInactive() {
    return new Promise((resolve, reject) => {
      usersRef.where('status', '==', 'Inativo').get().then((snapshot) => {
        const users = snapshot.docs.map((doc) => {
          const user = {
            id: doc.id,
            ...doc.data()
          };
          return user;
        });
        resolve(users);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a user by it's id
   * @param {string} id - User Id
   * @returns {Object} User Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      usersRef.doc(id).get().then((doc) => {
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
   * Create a new user
   * @param {Object} user - User Document Data
   * @returns {string} New user Id
   */
  static create(user, id) {
    return new Promise((resolve, reject) => {
      usersRef.doc(id).set(user).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a user
   * @param {string} id - User Id
   * @param {Object} user - User Document Data
   * @returns {null}
   */
  static update(id, user) {
    return new Promise((resolve, reject) => {
      usersRef.doc(id).update(user).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a user
   * @param {string} id - User Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      usersRef.doc(id).update({ status: 'Inativo' }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a user by it's id
   * @param {string} id - User Id
   * @returns {Array} Array of orders
   */
  static getAllOrdersByUserId(id) {
    return new Promise((resolve, reject) => {
      usersRef.doc(id).collection('myOrders').get().then((snapshot) => {
        const orders = snapshot.docs.map((doc) => {
          const order = {
            id: doc.id,
            ...doc.data()
          };
          return order;
        });
        resolve(orders);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = User;
