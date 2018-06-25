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
  generic: {
    type: String,
    default: 'Genérico'
  },
  manufacturer: String,
  description: String,
  unit: {
    type: String,
    enum: ['kg', 'unidade'],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  // fields:
  chem: [{
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
      ProductModel.find({}).populate('chem').exec().then((results) => {
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
      ProductModel.findById(id).populate('chem').exec().then((result) => {
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
      ProductModel.findByIdAndUpdate(id, product).catch((err) => {
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
      ProductModel.findByIdAndUpdate(id, { active: false }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Prdoducts that match the desired category value
   * @param {string} value - Category value
   * @returns {Object} Product Document Data
   */
  static getAllByStatus(value) {
    return new Promise((resolve, reject) => {
      ProductModel.find({ category: value }).populate('chem').then((result) => {
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
}

module.exports = Product;
