const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  stock: Number,
  balance: Number,
  price: {
    low: Number,
    average: Number,
    high: Number
  },
  breakpoints: {
    low: Number,
    average: Number
  },
  minAmount: Number,
  delivery: {
    type: String,
    enum: ['em até 48 horas', 'em até 31 dias', 'safra', 'safrinha']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }
}, { timestamps: true, strict: false });

const OfferModel = mongoose.model('Offer', offerSchema);

class Offer {
  /**
   * Get all Offers from database
   * @returns {Array} Array of Offers
   */
  static getAll(id) {
    return new Promise((resolve, reject) => {
      OfferModel.find({}).populate({
        path: 'seller product',
        populate: { path: 'chem' }
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
  static getById(idProduct, idOffer) {
    return new Promise((resolve, reject) => {
      OfferModel.findById(id).populate({
        path: 'seller product',
        populate: { path: 'chem' }
      }).exec().then((result) => {
        resolve(result.toObject());
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new Offer
   * @param {Object} project - Offer Document Data
   * @returns {string} New Offer Id
   */
  static create(id, offer) {
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
  static update(idProduct, id, offer) {
    return new Promise((resolve, reject) => {
      OfferModel.findByIdAndUpdate(id, offer).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a Offer
   * @param {string} id - Offer Id
   * @returns {null}
   */
  static delete(id, idProduct) {
    return new Promise((resolve, reject) => {
      OfferModel.findByIdAndDelete(id).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Offer;
