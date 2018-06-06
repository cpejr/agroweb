const firebase = require('firebase');

const productsRef = firebase.firestore().collection('products');

class Similar {
  /**
   * Get all similars from a similar
   * @param {String} productId - Id of the original product
   * @returns {Array} Array of Similars
   */
  static getAll(productId) {
    return new Promise((resolve, reject) => {
      productsRef.doc(productId).colection('similars').get().then((snapshot) => {
        const similars = snapshot.docs.map((doc) => {
          const similar = {
            id: doc.id,
            ...doc.data()
          };
          return similar;
        });
        resolve(similars);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a similar by it's id
   * @param {string} id - similar Id
   * @param {String} productId - Id of the original product
   * @returns {Object} similar Document Data
   */
  static getById(id, productId) {
    return new Promise((resolve, reject) => {
      productsRef.doc(productId).colection('similars').doc(id).get().then((doc) => {
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
   * Create a new similar
   * @param {Object} similar - Similar Document Data
   * @param {String} productId - Id of the original product, if needed.
   * @returns {string} New similar Id
   */
  static create(similar, productId = null) {
    return new Promise((resolve, reject) => {
      const data =
        {
          active: similar.active,
          name: similar.name,
          image: similar.image,
          description: similar.description,
          original: similar.original
        };
      if (productId != null) {
        data.original = productId;
      }
      if (
        data.active === undefined ||
        data.name === undefined ||
        data.original === undefined
      ) {
        reject(Error('Invalid data for product creation.'));
      }
      productsRef.doc(data.original).collection('similars').add(similar).then((doc) => {
        resolve(doc.id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a similar
   * @param {string} id - similar Id
   * @param {Object} similar - similar Document Data
   * @param {String} productId - Id of the original product,if needed
   * @returns {null}
   */
  static update(id, similar, productId = null) {
    return new Promise((resolve, reject) => {
      const data =
        {
          active: similar.active,
          name: similar.name,
          image: similar.image,
          description: similar.description,
          original: similar.original
        };
      if (productId != null) {
        data.original = productId;
      }
      productsRef.doc(data.original).collection('similars').doc(id).update(similar).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Deactivate a product
   * @param {String} productId - Id of the original product
   * @param {string} id - Product Id
   * @returns {null}
   */
  static deactivate(productId, id) {
    return Similar.update(id, { active: false }, productId);
  }

  /**
   * Delete a similar
   * @param {String} productId - Id of the original product
   * @param {string} id - similar Id
   * @returns {null}
   */
  static delete(productId, similarId) {
    return new Promise((resolve, reject) => {
      productsRef.doc(productId).collection('similars').doc(similarId).delete().catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Similar;
