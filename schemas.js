//  FOR JOI SCHEMAS
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Adds extension with `sanitize-html` npm package to prevent XSS injections
const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {}
        });
        if (clean !== value) return helpers.error('string.escapeHTML', { value });
        return clean;
      }
    }
  }
});

// Extend Joi to add validation against XSS attacks
const Joi = BaseJoi.extend(extension);

// validates errors BEFORE mongoose not the same as mongo schema
const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML()
  }).required(),
  deleteImages: Joi.array()
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5) ,
    body: Joi.string().required().escapeHTML,
  }).required()
});

module.exports = { campgroundSchema, reviewSchema };
