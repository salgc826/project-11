'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');

const User = require('./models/User').User;
const Course = require('./models/Course').Course;
const Review = require('./models/Review').Review;

const app = express();

// session to track logins
app.use(session({
  secret: 'this is a secret',
  resave: true,
  saveUninitialized: false
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var seeder = require('mongoose-seeder'),
  data = require('./data/data.json');

mongoose.connect('mongodb://localhost:27017/test');

var db = mongoose.connection;

db.on('error', function (err) {
  console.error(`connection error: ${err}`);
});

db.once("open", function () {
  seeder.seed(data).then(function (dbData) {
    // The database objects are stored in dbData
  }).catch(function (err) {
    // handle error
    console.error(err);
  });
  console.log(`db connection successful!`);
});

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// catch 404 and forward to global error handler
app.use(function (req, res, next) {
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// Express's global error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get('port'), function () {
  console.log('Express server is listening on port ' + server.address().port);
});
