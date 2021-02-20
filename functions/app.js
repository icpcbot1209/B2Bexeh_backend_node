require('app-module-path').addPath(__dirname);
require('dotenv').config();

var serviceAccount = require('my-firebase.json');
var fs = require('firebase-admin');
fs.initializeApp({
  credential: fs.credential.cert(serviceAccount),
});

var express = require('express');
var app = express();

var cors = require('cors');
app.use(cors());

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var path = require('path');
var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/dist')));

app.use('/api/v2', require('./app/api/v2/routes')(express));

module.exports = app;
