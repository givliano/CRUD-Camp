const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// Setup db
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected'));

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// serves the static public directory
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'thishouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  // expire the cookie in a week
  // httpOnly to prevent XSS attacks
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// use the authenticate method in the user for the LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// how to store the User in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  // on every request we will take what is in the req.flash and pass it on so
  // modules have acces to it under the key success
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// sets routes for the campground
app.use('/campgrounds', campgroundRoutes);

// sets routes for the reviews
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
  // Err is passed from the next on app.all
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error', { err })
  // res.send('Oh boy')
});

// not necessary after populating it with the seed
// app.get('/makecampground', async (req, res) => {
//   const camp = new Campground({ title: 'My Backyard', description: 'Cheap Camping' });
//   await camp.save()
//   res.send(camp);
// });

app.listen(3000, () => console.log('Serving on port 3000'));
