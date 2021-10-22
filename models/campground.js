const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

// Creates Schema
const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

CampgroundSchema.post('findOneAndDelete', async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        // Queries the _id inside the reviews in the doc.reviews array of this campground
        $in: doc.reviews
      }
    });
  }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
