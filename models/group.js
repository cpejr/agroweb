const firebase = require('firebase');

const groupsRef = firebase.firestore().collection('groups');

class Group {
  /**
   * Get all groups from database
   * @returns {Array} Array of groups
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      groupsRef.get().then((snapshot) => {
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
   * @param {string} id - Group Id
   * @returns {Object} Group Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(id).get().then((doc) => {
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
   * Create a new group
   * @param {Object} group - Group Document Data
   * @returns {string} New group Id
   */
  static create(group) {
    return new Promise((resolve, reject) => {
      groupsRef.add(group).then((doc) => {
        resolve(doc.id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a group
   * @param {string} id - Group Id
   * @param {Object} group - Group Document Data
   * @returns {null}
   */
  static update(id, group) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(id).update(group).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a group
   * @param {string} id - Group Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      groupsRef.doc(id).delete().catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Group;
