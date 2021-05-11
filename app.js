var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var roomRouter = require('./routes/room');

var session = require('express-session')

// db
var mongoose = require('mongoose')

var app = express();

app.use((req, res, next) => {
  req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
})

//session
app.use(session({
  secret: 'asdaevdcweds',
  resave: false,
  saveUninitialized: true,
  cookie: {  expires: 600000 }
}))

// db connect
mongoose.connect('mongodb://localhost:27017/test',
    {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log(app.settings.port,'MongoDB Connected...'))
    .catch(err => console.log(err))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/room', roomRouter);

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
