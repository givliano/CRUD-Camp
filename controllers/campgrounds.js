// File for the logic, implementation of the queries of the campground models, all the render call
const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res) => {
  // req.body.campground comes from the form fields under campground[X]
  // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400) -> made obsolete with validateCampground
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  await campground.save();
  req.flash('success', 'Successfully made a new background');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  // populates the reviews array of the campground
  const campground = await Campground
    .findById(req.params.id)
    // Populates the reviews field and then the author field inside each review
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    }).populate('author');

  if (!campground) {
    req.flash('error', 'Cannot find the campground.');
    // return so doenst execute the show page
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Cannot find the campground.');
    // return so doenst execute the show page
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
  // the id comes from the url. :id sets the value name to id
  const { id } = req.params;
  // req.body.campground is composed of title and location keys
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash('success', 'Successfully updated campground');
  res.redirect(`/campgrounds/${ campground._id }`)
}

// in other frameworks such as RoR delete will be named `destroy`
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted campground');
  res.redirect('/campgrounds');
}
