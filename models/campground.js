const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
  url: String,
  filename: String
});

// Creates a virtual property on memory to get the thumbnailed version of the images
// 200 px wide
ImageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_200');
});

// Creates Schema
const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
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
