const firebase = require('firebase');

const newslettersRef = firebase.firestore().collection('newsletters');

class Newsletter {
  /**
   * Get all newsletters from database
   * @returns {Array} Array of newsletters
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      newslettersRef.get().then((snapshot) => {
        const newsletters = snapshot.docs.map((doc) => {
          const newsletter = {
            id: doc.id,
            ...doc.data()
          };
          return newsletter;
        });
        resolve(newsletters);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a newsletter by it's id
   * @param {string} id - Newsletter Id
   * @returns {Object} Newsletter Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      newslettersRef.doc(id).get().then((doc) => {
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
   * Create a new newsletter
   * @param {Object} newsletter - Newsletter Document Data
   * @returns {string} New newsletter Id
   */
  static create(newsletter) {
    return new Promise((resolve, reject) => {
      newslettersRef.add(newsletter).then((doc) => {
        resolve(doc.id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a newsletter
   * @param {string} id - Newsletter Id
   * @param {Object} newsletter - Newsletter Document Data
   * @returns {null}
   */
  static update(id, newsletter) {
    return new Promise((resolve, reject) => {
      newslettersRef.doc(id).update(newsletter).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a newsletter
   * @param {string} id - Newsletter Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      newslettersRef.doc(id).delete().catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Newsletter;
