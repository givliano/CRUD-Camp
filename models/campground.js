const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

// Gotta set mongoose to include virtual properties in toJSON calls
const options = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
  url: String,
  filename: String
});

// Creates Schema
const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
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
}, options);

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

// Creates a virtual property on memory to get the thumbnailed version of the images
// 200 px wide
ImageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_200');
});

CampgroundSchema.virtual('properties.popupMarkup').get(function() {
  return `
    <strong><a href=/campgrounds/${this._id}>${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>
  `;
});

module.exports = mongoose.model('Campground', CampgroundSchema);
