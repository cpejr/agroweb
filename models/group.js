const firebase = require('firebase');

const groupsRef = firebase.firestore().collection('products');

class Group {
  /**
   * Get all groups from database
   * @param {string} id - Product Id
   * @returns {Array} Array of groups
   */
  static getAll(id) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(id).collection('groups').get().then((snapshot) => {
        const groups = snapshot.docs.map((doc) => {
          const group = {
            id: doc.id,
            ...doc.data()
          };
          return group;
        });
        resolve(groups);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a group by it's id
   * @param {string} idProduct - Product Id
   * @param {string} idGroup - Group Id
   * @returns {Object} Group Document Data
   */
  static getById(idProduct, idGroup) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(idProduct).collection('groups').doc(idGroup).get().then((doc) => {
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
   * Get a buyingUsers group by it's id
   * @param {string} idProduct - Product Id
   * @param {string} idGroup - Group Id
   * @returns {Object} Group Document Data
   */
  static getBuyingUsers(idProduct, idGroup) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(idProduct).collection('groups').doc(idGroup).collection('buyingUsers').get().then((snapshot) => {
        const buyingUsers = snapshot.docs.map((doc) => {
          const buyingUser = {
            id: doc.id,
            ...doc.data()
          };
          return buyingUser;
        });
        resolve(buyingUsers);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new group by ProductId
   * @param {Object} group - Group Document Data
   * @param {string} id - Product id
   * @param {Object} user - Group Document Data
   * @returns {string} New group Id
   */
  static create(group, id, user) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(id).collection('groups').add(group).then((doc) => {
        groupsRef.doc(id).collection('groups').doc(doc.id).collection('buyingUsers').add(user).then((doc) => {
          resolve(doc.id);
        })
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a group
   * @param {string} idProduct - Product Id
   * @param {string} idGroup - Group Id
   * @param {Object} group - Group Document Data
   * @returns {null}
   */
  static update(idProduct, idGroup, group) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(idProduct).collection('groups').doc(idGroup).update(group).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a group
   * @param {string} idGroup - Group Id
   * @param {string} idProduct - Product Id
   * @returns {null}
   */
  static delete(idGroup, idProduct) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(idProduct).collection('groups').doc(idGroup).delete().catch((err) => {
        reject(err);
      });
    });
  }
}
module.exports = Group;
