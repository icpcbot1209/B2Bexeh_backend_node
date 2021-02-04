const functions = require('firebase-functions');
const app = require('./app.js');

exports.superfractorApp = functions.https.onRequest(app);
