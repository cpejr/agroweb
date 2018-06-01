const firebase = require('firebase');

const offersRef = firebase.firestore().collection('offers');

class Offer {
  /**
   * Get all offers from database
   * @returns {Array} Array of offers
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      offersRef.get().then((snapshot) => {
        const offers = snapshot.docs.map((doc) => {
          const offer = {
            id: doc.id,
            ...doc.data()
          };
          return offer;
        });
        resolve(offers);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a offer by it's id
   * @param {string} id - Offer Id
   * @returns {Object} Offer Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      offersRef.doc(id).get().then((doc) => {
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
   * Create a new offer
   * @param {Object} offer - Offer Document Data
   * @returns {string} New offer Id
   */
  static create(offer) {
    return new Promise((resolve, reject) => {
      offersRef.add(offer).then((doc) => {
        resolve(doc.id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a offer
   * @param {string} id - Offer Id
   * @param {Object} offer - Offer Document Data
   * @returns {null}
   */
  static update(id, offer) {
    return new Promise((resolve, reject) => {
      offersRef.doc(id).update(offer).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a offer
   * @param {string} id - offer Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      offersRef.doc(id).delete().catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Offer;
