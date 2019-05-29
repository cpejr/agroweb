const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  fullName: String,
  email: {
    type: String,
    unique: true
  }
}, { timestamps: true, strict: false });

const NewsletterModel = mongoose.model('Newsletter', newsletterSchema);

class Newsletter {
  /**
   * Get all Newsletters from database
   * @returns {Array} Array of Newsletters
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      NewsletterModel.find({}).populate().exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a Newsletter by it's id
   * @param {string} id - Newsletter Id
   * @returns {Object} Newsletter Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      NewsletterModel.findById(id).populate('user').exec().then((result) => {
        resolve(result.toObject());
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new Newsletter
   * @param {Object} project - Newsletter Document Data
   * @returns {string} New Newsletter Id
   */
  static create(newsletter) {
    return new Promise((resolve, reject) => {
      NewsletterModel.create(newsletter).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Newsletter
   * @param {string} id - Newsletter Id
   * @param {Object} Newsletter - Newsletter Document Data
   * @returns {null}
   */
  static update(id, newsletter) {
    return new Promise((resolve, reject) => {
      NewsletterModel.findByIdAndUpdate(id, newsletter).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a Newsletter
   * @param {string} id - Newsletter Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      NewsletterModel.findByIdAndDelete(id).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Deletes all Newsletters from DB
   * @returns {null}
   */
  static clear() {
    return new Promise((resolve, reject) => {
      NewsletterModel.deleteMany({}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Newsletter;
