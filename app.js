var express = require('express');

var path = require('path');
var session = require('express-session');
var MemoryStore = require('memorystore')(session);
var indexRouter = require('./routes/index');
var upload = require('express-fileupload');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
// var enforce = require('express-sslify');
var passport = require('passport');
require('./passport_setup')(passport);
let bodyParser = require('body-parser');

var app = express();
var models = require('./models');
const bookingController = require('./controllers/BookingController');
models.sequelize.sync().then(async function() {


  setInterval(bookingController.syncCalendars, 5*60000);
  // await bookingController.syncCalendars();
  console.log("Database Connection")
}).catch(function(err) {

    console.log(err, "Database connection has failed!")
  
  });

 if(!app.get('env') === 'development')
 {
   app.use(enforce.HTTPS({trustProtoHeader:true}))
 }
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(upload());

app.use(bodyParser.json({
  verify: function (req, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith('/stripe')) {
          req.rawBody = buf.toString()
      }
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// this order is important
// cryto generate the secret
app.use(session(
  {secret:'our new secret',
  saveUninitialized:false,
  resave:false,
  store: new MemoryStore({checkPeriod:86400000})
})
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });


module.exports = app;