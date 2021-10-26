const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// Setup db
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected'));

// gets a random element from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  // deletes everything in the document
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '6176c4ad68e98183557327c8',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
      price,
      images: [
        {
          url: 'https://res.cloudinary.com/fi2h30h/image/upload/v1635287059/YelpCamp/acm8x6t9em94wvyyq5fq.jpg',
          filename: 'YelpCamp/acm8x6t9em94wvyyq5fq'
        }
      ]
    })
     await camp.save();
  }
}

seedDB().then(() => {
  console.log('Disconnecting database from seed');
  db.close();
});
