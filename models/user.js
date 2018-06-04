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
  static create(user) {
    return new Promise((resolve, reject) => {
      usersRef.add(user).then((doc) => {
        resolve(doc.id);
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
      usersRef.doc(id).delete().catch((err) => {
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
          doc.data.product.get().then((offer) => {
            offer.data.product.get().then((product) => {
              offer.data.offerter.get().then((offerter) => {
                const order = {
                  id: doc.id,
                  price: doc.data.price,
                  quantity: doc.data.quantity,
                  ...product.data(),
                  ...offerter.data()
                };
                return order;
              });
            });
          });
        });
        resolve(orders);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = User;
