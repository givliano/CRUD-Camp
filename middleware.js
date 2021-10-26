const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
  // isAuthenticated is a method added by passport.js
  if (!req.isAuthenticated()) {
    // originalUrl is a express-session variable that keeps the ref
    // to the Url from which the req was made.
    // Another cool value to know is req.path
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in first');
    return res.redirect('/login');
  }
  next();
};

// For Joi validation of the campground form
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    // detail is an object that must be parsed
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// For Joi validation of the review form
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(er => er.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that');
    return res.redirect(`/campgrounds/${ id }`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that');
    return res.redirect(`/campgrounds/${ id }`);
  }
  next();
};
