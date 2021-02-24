var serviceAccount = require(process.env.FIREBASE_FILE);
var firebase = require('firebase-admin');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

module.exports = firebase;
