var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();
var indexRouter = require('./routes/index');
var cmsRouter = require('./routes/cms');
var nunjucks = require('nunjucks');
var busboy = require('connect-busboy');

var app = express();

nunjucks.configure(['views', 'dist'], {
  autoescape: true,
  express: app,
  noCache: true,
});

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('template', path.join(__dirname, 'src'));
app.set('view engine', 'html');

app.use(cors());
app.use(logger('dev'));
app.use(busboy({ immediate: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './src/public')));
app.use(express.static(path.join(__dirname, './public')));

app.use('/', indexRouter);
app.use('/cms', cmsRouter);

// app.all('/*', async (req, res, next) => {
//   try {
//     res.sendFile('/public/index.html', { root: __dirname });
//   } catch (error) {
//     console.log(error);
//   }
// });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.nunjucks');
});

module.exports = app;
