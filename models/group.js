const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  amount: Number,
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  price: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true, strict: false });

const GroupModel = mongoose.model('Group', groupSchema);

class Group {
  /**
   * Get all Groups from database
   * @returns {Array} Array of Groups
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      GroupModel.find({}).populate({
        path: 'users offer',
        populate: {
          path: 'seller product',
          populate: { path: 'chem' }
        }
      }).exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a Group by it's id
   * @param {string} id - Group Id
   * @returns {Object} Group Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      GroupModel.findById(id).populate({
        path: 'users offer',
        populate: {
          path: 'seller product',
          populate: { path: 'chem' }
        }
      }).exec().then((result) => {
        resolve(result.toObject());
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new Group
   * @param {Object} group - Group Document Data
   * @returns {string} New Group Id
   */
  static create(group) {
    return new Promise((resolve, reject) => {
      GroupModel.create(group).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Group
   * @param {string} id - Group Id
   * @param {Object} Group - Group Document Data
   * @returns {null}
   */
  static update(id, group) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndUpdate(id, group).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a Group
   * @param {string} id - Group Id
   * @returns {null}
   */
  static delete(id) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndDelete(id).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Add a new User
   * @param {string} id - Group Id
   * @param {string} user - User Id
   * @returns {null}
   */
  static addUser(id, user) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndUpdate(id, { $push: { users: user } }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Delete a new User
   * @param {string} id - Group Id
   * @param {string} user - User Id
   * @returns {null}
   */
  static deleteUser(id, user) {
    return new Promise((resolve, reject) => {
      GroupModel.findByIdAndUpdate(id, { $pop: { users: user } }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get all Groups that match the desired query
   * @param {Object} query - Object that defines the filter
   * @param {Object} sort - Object that defines the sort method
   * @returns {Object} Product Document Data
   */
  static getByQuerySorted(query, sort) {
    return new Promise((resolve, reject) => {
      GroupModel.find(query).populate({
        path: 'users offer',
        populate: {
          path: 'seller product',
          populate: { path: 'chem' }
        }
      }).exec().sort(sort).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Group;