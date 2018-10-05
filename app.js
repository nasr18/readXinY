const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');

require('dotenv/config');

// Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

// Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

// Initiate our app
const app = express();

// Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.jwt_secret,
    cookie: { maxAge: process.env.jwt_maxAge },
    resave: false,
    saveUninitialized: false,
  })
);

/* if (!isProduction) {
  app.use(errorHandler());
} */

// Configure Mongoose
mongoose.set('debug', process.env.dbDebug);
mongoose
  .connect(process.env.dbUri)
  .then(connection => {
    console.log(`Mongoose connection established to ${process.env.dbUri}`);
  })
  .catch(err => {
    console.error('Mongoose connection failed', { err });
  });

// Models & routes
require('./models/Users');
require('./config/passport');
app.use(require('./routes'));

// Error handlers & middlewares
app.use((err, req, res) => {
  console.log('errHandler:', err);
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: !isProduction ? err : {},
    },
  });
});

app.listen(process.env.PORT || 8000, () =>
  console.log(`ReadXinY Server running on http://localhost:${process.env.PORT}`)
);
