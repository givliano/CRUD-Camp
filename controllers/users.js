const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegister = (req, res) => {
  res.render('users/register')
};

module.exports.register = async(req, res) => {
  try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    // passport method login
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome to Yelp Camp!');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = async (req, res) => {
  req.flash('success', 'Welcome back');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  // deletes the ref after login in
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
  // passport logout method
  req.logout();
  req.flash('success', 'Goodbye');
  res.redirect('/campgrounds');
};
