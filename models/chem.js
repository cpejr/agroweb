const mongoose = require('mongoose');

const chemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true, strict: false });

const ChemModel = mongoose.model('Chem', chemSchema);

class Chem {
  /**
   * Get all Chems from database
   * @returns {Array} Array of Chems
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      ChemModel.find({}).populate().exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a Chem by it's id
   * @param {string} id - Chem Id
   * @returns {Object} Chem Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      ChemModel.findById(id).populate().exec().then((result) => {
        resolve(result.toObject());
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new Chem
   * @param {Object} project - Chem Document Data
   * @returns {string} New Chem Id
   */
  static create(chem) {
    return new Promise((resolve, reject) => {
      ChemModel.create(chem).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Chem
   * @param {string} id - Chem Id
   * @param {Object} Chem - Chem Document Data
   * @returns {null}
   */
  static update(id, chem) {
    return new Promise((resolve, reject) => {
      ChemModel.findByIdAndUpdate(id, chem).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a Chem
   * @param {string} id - Chem Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      ChemModel.findByIdAndUpdate(id, { active: false }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Chems that match the desired query
   * @param {Object} query - Object that defines the filter
   * @param {Object} sort - Object that defines the sort method
   * @returns {Array} Array of Chems
   */
  static getByQuerySorted(query, sort) {
    return new Promise((resolve, reject) => {
      ChemModel.find(query).sort(sort).populate().exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a Chem that match the desired query
   * @param {Object} query - Object that defines the filter
   * @returns {Object} Chem Document Data
   */
  static getOneByQuery(query) {
    return new Promise((resolve, reject) => {
      ChemModel.findOne(query).exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Deletes all chems from DB
   * @returns {null}
   */
  static clear() {
    return new Promise((resolve, reject) => {
      ChemModel.deleteMany({}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Chem;
