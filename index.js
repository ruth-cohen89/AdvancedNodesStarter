const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');

require('./models/User');
require('./models/Blog');
require('./services/passport');
require('./services/cache');

mongoose.connect(keys.mongoURI, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5s if not connected
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:' , err));

const app = express();

app.use(express.json());

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // exp in 30 days
    keys: [keys.cookieKey],
  })
);

app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/blogRoutes')(app);

if (['production', 'ci'].includes(process.env.NODE_ENV)) {
  app.use(express.static('client/build'));

  const path = require('path');

  app.get('/*path', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port`, PORT);
});

