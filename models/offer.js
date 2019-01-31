const mongoose = require('mongoose');
const User = require('./user');

const offerSchema = new mongoose.Schema({
  stock: Number,
  balance: {
    type: Number,
    default: 0
  },
  unitPrice: Number,
  price: {
    low: Number,
    average: Number,
    high: Number
  },
  breakpoints: { // Quantidade de Produto pro preço mudar
    low: Number,
    average: Number
  },
  minAmount: Number,
  delivery: {
    type: String,
    enum: ['48 horas', '31 dias', 'Safra', 'Safrinha']
  },
  usd: Boolean,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  active: {
    type: Boolean,
    default: true
  },
  megaOpportunity: {
    type: Boolean,
    default: false
  },
  damage: String
}, { timestamps: true, strict: false });

const OfferModel = mongoose.model('Offer', offerSchema);

class Offer {
  /**
   * Get all Offers from database
   * @returns {Array} Array of Offers
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      OfferModel.find({}).populate({
        path: 'seller product',
        populate: { path: 'chems' }
      }).exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a Offer by it's id
   * @param {string} id - Offer Id
   * @returns {Object} Offer Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      OfferModel.findById(id).populate({
        path: 'seller product',
        populate: { path: 'chems' }
      }).exec().then((result) => {
        resolve(result.toObject());
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new Offer
   * @param {Object} offer - Offer Document Data
   * @returns {string} New Offer Id
   */
  static create(offer) {
    return new Promise((resolve, reject) => {
      OfferModel.create(offer).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Offer
   * @param {string} id - Offer Id
   * @param {Object} Offer - Offer Document Data
   * @returns {null}
   */
  static update(id, offer) {
    return new Promise((resolve, reject) => {
      OfferModel.findByIdAndUpdate(id, offer).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Active a Offer
   * @param {string} id - Offer Id
   * @returns {null}
   */
  static active(id) {
    return new Promise((resolve, reject) => {
      OfferModel.findByIdAndUpdate(id, { active: true }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a Offer
   * @param {string} id - Offer Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      OfferModel.findByIdAndUpdate(id, { active: false }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Offers that match the desired query
   * @param {Object} query - Object that defines the filter
   * @param {Object} sort - Object that defines the sort method
   * @returns {Object} Offer Document Data
   */
  static getByQuerySorted(query, sort) {
    return new Promise((resolve, reject) => {
      OfferModel.find(query).sort(sort).populate({
        path: 'seller product',
        populate: { path: 'chems' }
      }).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Deletes all offers from DB
   * @returns {null}
   */
  static clear() {
    return new Promise((resolve, reject) => {
      OfferModel.deleteMany({}).then(() => {
        User.clearOffers.then(() => {
          resolve();
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Offer;
