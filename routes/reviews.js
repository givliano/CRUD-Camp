const express = require('express');
// sets mergeParams to true so the router params aren't isolated (the :id param is being
// passed from the app.js
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete the review for the campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
