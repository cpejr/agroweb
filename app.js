
/**
 * Enviroment Variables Setup
 */
require('dotenv').config();

/**
 * Dependencies
 */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const methodOverride = require('method-override');
const sassMiddleware = require('node-sass-middleware');
const firebase = require('firebase');
const nodemailer = require('nodemailer');
require('firebase/firestore');

/**
 * Timestamp bug correction
 */
const firestore = firebase.firestore();
const settings = {
  timestampsInSnapshots: true
};
firestore.settings(settings);

/**
 * Firebase Setup
 */
const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID
};
firebase.initializeApp(config);

/**
 * Routes
 */
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const offersRouter = require('./routes/offers');
const productsRouter = require('./routes/products');
const maintenanceRouter = require('./routes/maintenance');
const newsletterRouter = require('./routes/newsletterlist');
const PDFgeneratorRouter = require('./routes/PDFgenerator');

/**
 * Application Initialization
 */
const app = express();

/**
 * View Engine Setup
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'some-private-cpe-key',
  resave: false,
  saveUninitialized: false
}));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes Setup
 */
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/offers', offersRouter);
app.use('/products', productsRouter);
app.use('/maintenance', maintenanceRouter);
app.use('/newsletterlist', newsletterRouter);
app.use('/PDFgenerator', PDFgeneratorRouter);

/**
 * Error Handling
 */
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
