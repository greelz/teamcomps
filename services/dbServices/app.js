/** Below is the default app.js file, commenting out to follow this tutorial: https://medium.com/@onejohi/building-a-simple-rest-api-with-nodejs-and-express-da6273ed7ca9
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
 */

var express = require("express");
var cors = require('cors')
var bodyParser= require('body-parser');
var matchRouter = require('./routes/matches');
var clientController = require('./processing/clientRequests');

var app = express();

app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));

app.get("/url", (req, res, next) => 
  {
   res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]); 
  }
);

app.options("/getWinPercentAndNextChamps", cors(), (req, res, next) =>
{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Accept", "application/json");
  res.header("Content-Type", "application/json");
  res.send();
});// apparently this allows cors requests? I probably just shouldn't use a JSON body at this point huh
app.post("/getWinPercentAndNextChamps", cors(), (req, res, next) =>
{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Accept", "application/json");
  res.header("Content-Type", "application/json");
  var queryResults;
  clientController.getWinPercentage(req, (response) =>
  {
    res.json(response);
    //res.send(response);
  });
  // res.send();
});

app.use('/matches', matchRouter);

app.listen(2021, () => {
 console.log("Server running on port 2021");
});

module.exports = app;