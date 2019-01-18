const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Fertilizantes sólidos', 'Defensivos agrícolas/agrotóxicos', 'Sementes', 'Fertilizantes líquidos/adjuvantes/biológicos'],
    required: true
  },
  status: {
    type: String,
    enum: ['Aprovado', 'Aguardando'],
    required: true
  },
  generic: {
    type: String,
    default: 'Similar'
  },
  manufacturer: String,
  description: String,
  unit: {
    type: String,
    enum: ['kg', 'un', 'L', 'ton'],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  chems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chem'
  }]
}, { timestamps: true, strict: false });

const ProductModel = mongoose.model('Product', productSchema);

class Product {
  /**
   * Get all Products from database
   * @returns {Array} Array of Products
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      ProductModel.find({}).populate('chems').exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a Product by it's id
   * @param {string} id - Product Id
   * @returns {Object} Product Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      ProductModel.findById(id).populate('chems').exec().then((result) => {
        resolve(result.toObject());
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new Product
   * @param {Object} project - Product Document Data
   * @returns {string} New Product Id
   */
  static create(product) {
    return new Promise((resolve, reject) => {
      ProductModel.create(product).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Product
   * @param {string} id - Product Id
   * @param {Object} Product - Product Document Data
   * @returns {null}
   */
  static update(id, product) {
    return new Promise((resolve, reject) => {
      ProductModel.findByIdAndUpdate(id, product).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a Product
   * @param {string} id - Product Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      ProductModel.findByIdAndUpdate(id, { active: false }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Products that match the desired category value
   * @param {string} value - Category value
   * @returns {Object} Product Document Data
   */
  static getAllByCategory(value) {
    return new Promise((resolve, reject) => {
      ProductModel.find({ category: value }).populate('chems').then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Products that match the desired query
   * @param {Object} query - Object that defines the filter
   * @param {Object} sort - Object that defines the sort method
   * @returns {Object} Product Document Data
   */
  static getByQuerySorted(query, sort) {
    return new Promise((resolve, reject) => {
      ProductModel.find(query).sort(sort).populate('chems').then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Add a chem
   * @param {string} id - Product Id
   * @param {Object} chem - Chem Id
   * @returns {null}
   */
  static addChem(id, chem) {
    return new Promise((resolve, reject) => {
      ProductModel.findByIdAndUpdate(id, { $push: { chems: chem } }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Deletes all products from DB
   * @returns {null}
   */
  static clear() {
    return new Promise((resolve, reject) => {
      ProductModel.deleteMany({}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Product;
