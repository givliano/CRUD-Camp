if (process.env.NODE_ENV !== 'production') {
  // In development mode the config in the dotenv file will be
  // accessible in the process.env in node
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const session = require('express-session');
const flash = require('connect-flash');
// used to send put/delete verbs from forms
const methodOverride = require('method-override');
// used for authentication/authorization
const passport = require('passport');
const LocalStrategy = require('passport-local');
// used to prevent mongo injections
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet'); // secure http headers
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
// sets mongoSanitize to replace mongo queries from the url or other injections
// with a underscore
app.use(mongoSanitize({
  replaceWith: '_'
}))

const sessionConfig = {
  name: 'session', // sets the name for the sessions instead of sid
  secret: 'thishouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  // expire the cookie in a week
  cookie: {
    httpOnly: true, // httpOnly to prevent XSS attacks
    // secure: true, // sets the cookie to be configurable only via https
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];

const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];

const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/fi2h30h/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

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
