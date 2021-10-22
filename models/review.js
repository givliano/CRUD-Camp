const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// One to many relationship
const reviewSchema = new Schema({
  body: String,
  rating: Number
});

module.exports = mongoose.model('Review', reviewSchema);
