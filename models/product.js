const firebase = require('firebase');

const productsRef = firebase.firestore().collection('products');

class Product {
  /**
   * Get all products from database
   * @returns {Array} Array of Products
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      productsRef.get().then((snapshot) => {
        const products = snapshot.docs.map((doc) => {
          const product = {
            id: doc.id,
            ...doc.data()
          };
          return product;
        });
        resolve(products);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  /**
   * Get all products and similars from database
   * @returns {Array} Array of Products and similars
   */

  static getAllWithSimilars() {
    return new Promise((resolve, reject) => {
      productsRef.get().then((snapshot) => {
        const products = [];
        const promises = [];
        snapshot.docs.forEach((doc) => {
          const product = {
            id: doc.id,
            ...doc.data()
          };
          products.push(product);
          const promise = productsRef.doc(doc.id).collection('similars').get();
          promises.push(promise);
          promise.then((simSnapshot) => {
            simSnapshot.docs.forEach((simDoc) => {
              const similar = {
                id: simDoc.id,
                ...simDoc.data()
              };
              products.push(similar);
            });
          })
            .catch(err => reject(err));
        });
        Promise.all(promises).then(() => resolve(products));
      }).catch(err => reject(err));
    });
  }
  /**
   * Get a product by it's id
   * @param {string} id - Product Id
   * @returns {Object} Product Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      productsRef.doc(id).get().then((doc) => {
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
   * Create a new product
   * @param {Object} product - Product Document Data
   * @returns {string} New Product Id
   */
  static create(product) {
    return new Promise((resolve, reject) => {
      const data =
      {
        active: product.active,
        activePriciplpe: product.activePriciplpe,
        category: product.category,
        name: product.name,
        image: product.image,
        description: product.description,
        measureUnit: product.measureUnit
      };
      if (
        data.active === undefined ||
        data.activePriciplpe === undefined ||
        data.category === undefined ||
        data.name === undefined ||
        data.measureUnit === undefined
      ) {
        reject(Error('Invalid data for product creation.'));
      }
      productsRef.add(product).then((doc) => {
        resolve(doc.id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a product
   * @param {string} id - Product Id
   * @param {Object} product - Product Document Data
   * @returns {null}
   */
  static update(id, product) {
    return new Promise((resolve, reject) => {
      const data =
      {
        active: product.active,
        activePriciplpe: product.activePriciplpe,
        category: product.category,
        name: product.name,
        image: product.image,
        description: product.description,
        measureUnit: product.measureUnit
      };
      productsRef.doc(id).update(data).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Deactivate a product
   * @param {string} id - Product Id
   * @returns {null}
   */
  static deactivate(id) {
    return Product.update(id, { active: false });
  }


  /**
   * Delete a product
   * @param {string} id - Product Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      productsRef.doc(id).delete().catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Product;
