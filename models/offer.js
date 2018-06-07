const firebase = require('firebase');

const offersRef = firebase.firestore().collection('products');

class Offer {
  /**
   * Get all offers of a product from database
    * @param {string} id - Product Id
   * @returns {Array} Array of offers
   */
  static getAll(id) {
    return new Promise((resolve, reject) => {
      offersRef.doc(id).collection('offers').get().then((snapshot) => {
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
   * @param {string} idProduct - Product Id
   * @param {string} idOffer - Offer Id
   * @returns {Object} Offer Document Data
   */
  static getById(idProduct, idOffer) {
    return new Promise((resolve, reject) => {
      offersRef.doc(idProduct).collection('offers').doc(idOffer).get().then((doc) => {
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
   * Create a new offer by idProduct
   * @param {Object} offer - Offer Document Data
   * @param {string} id - Product Id
   * @returns {string} New offer Id
   */
  static create(id, offer) {
    return new Promise((resolve, reject) => {
      offersRef.doc(id).collection('offers').add(offer).then((doc) => {
        resolve(doc.id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a offer
   * @param {string} idProduct - Product Id
   * @param {string} id - Offer Id
   * @param {Object} offer - Offer Document Data
   * @returns {null}
   */
  static update(idProduct, id, offer) {
    return new Promise((resolve, reject) => {
      offersRef.doc(idProduct).collection('offers').doc(id).update(offer).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a offer
   * @param {string} id - offer Id
   * @param {string} idProduct - Product Id
   * @returns {null}
   */
  static delete(id, idProduct) {
    return new Promise((resolve, reject) => {
      offersRef.doc(idProduct).collection('offers').doc(id).delete().catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Offer;
