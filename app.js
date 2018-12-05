
/**
 * Enviroment Variables Setup
 */
require('dotenv').config();

/**
 * Dependencies
 */
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const exphbs = require('express-handlebars');
const express = require('express');
const firebase = require('firebase');
const flash = require('express-flash');
const logger = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const session = require('express-session');
const schedule = require('node-schedule');
const configJson = require('./docs/config.json');
const fs = require('fs');

/**
 * Functions
 */
const Money = require('./functions/money');
const Delivery = require('./functions/delivery');

/**
 * Global Variables
 */
const globalConfig = configJson.development;
global.gConfig = globalConfig;

/**
 * Firebase Setup
 */
const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
};
firebase.initializeApp(config);

/**
 * Mongoose Setup
 */
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_SERVER}/${process.env.MONGO_DATABASE}?${process.env.MONGO_OPTIONS}`)
  .then(() => {
    console.log('Database connected.');
  }).catch((error) => {
    console.log('Database connection failed!');
    console.log(error);
  });

global.rising = 'true';
console.log(global.rising);
// Money.createPrevDollarJSON();

/**
 * Getting dollar quotation everyday
 */
schedule.scheduleJob('0 0 3 * * *', () => {
  Money.dailyDollarUpdate();
  Delivery.closeGroups().then(() => {
    console.log('Closed all groups successfully');
  }).catch((error) => {
    console.log(error);
  Money.getUsdValue().then((dollar) => {
    Money.getPrevUsdValue().then((prevDollar) => {
      if (dollar > prevDollar) {
        global.rising = 'true';
      }
      else {
        global.rising = 'false';
      }
      Money.createPrevDollarJSON();
    });
  });
});

/**
 * Getting dollar quotation everyday
 */
schedule.scheduleJob('0 */10 * * * *', () => {
  Money.createDollarJSON();
  Money.getUsdValue().then((dollar) => {
    // console.log(dollar);
    global.dollar = dollar;
  });
});

/**
 * Initializing dollar value
 */
Money.getUsdValue().then((dollar) => {
  // console.log(dollar);
  global.dollar = dollar;
});

/**
 * Routes
 */
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const offersRouter = require('./routes/offers');
const productsRouter = require('./routes/products');
const maintenanceRouter = require('./routes/maintenance');
const adminRouter = require('./routes/admin');
const newsletterRouter = require('./routes/newsletter');
const PDFRouter = require('./routes/PDF');
const groupsRouter = require('./routes/groups');
const quotationRouter = require('./routes/quotations');
const productRouter = require('./routes/products');
const transactionRouter = require('./routes/transaction');
const chemRouter = require('./routes/chems');
const testRouter = require('./routes/test');
const termsRouter = require('./routes/terms');
const searchRouter = require('./routes/search');
const componentsRouter = require('./routes/components');
const siteRouter = require('./routes/site');

/**
 * Application Initialization
 */
const app = express();

// View Engine Setup
app.engine('hbs', exphbs({
  defaultLayout: 'layout',
  extname: '.hbs',
  partialsDir: 'views/partials',
  helpers: {
    // Here we're declaring the #section that appears in layout/layout.hbs
    section(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },

    // If variable equals...
    ifCond(v1, v2, options) {
      if (v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    },

    ifNotEq(v1, v2, options) {
      if (v1 !== v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    },

    usdValue() {
      // console.log(global.dollar);
      return global.dollar;
    },
    rising() {
      if (global.rising === 'true') {
        return '<i class="fas fa-arrow-alt-circle-up fa-lg"></i>';
      }
      return '<i class="fas fa-arrow-alt-circle-down fa-lg"></i>';
    }
  }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/**
 * Application Configuration
 */
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'some-private-cpe-key',
  resave: true,
  saveUninitialized: true
}));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

/**
 * Routes Setup
 */
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/offers', offersRouter);
app.use('/products', productsRouter);
app.use('/maintenance', maintenanceRouter);
app.use('/admin', adminRouter);
app.use('/newsletter', newsletterRouter);
app.use('/PDF', PDFRouter);
app.use('/groups', groupsRouter);
app.use('/quotations', quotationRouter);
app.use('/products', productRouter);
app.use('/search', searchRouter);
app.use('/transaction', transactionRouter);
app.use('/chems', chemRouter);
app.use('/test', testRouter);
app.use('/terms', termsRouter);
app.use('/components', componentsRouter);
app.use('/site', siteRouter);

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
  res.render('error', {title: 'Erro', layout: 'layoutError'});
});

module.exports = app;
