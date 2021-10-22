const express = require('express');
// sets mergeParams to true so the router params aren't isolated (the :id param is being
// passed from the app.js
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas');

// For Joi validation of the review form
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(er => er.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post('/', validateReview, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'Created a new review.');
  res.redirect(`/campgrounds/${ campground._id }`);
}));

// delete the review for the campground
router.delete('/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  // $pull operator from mongoDB removes from an array all instances of a values that match a
  // specific condition
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review');
  res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
