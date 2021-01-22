const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions


exports.admin = functions.https.onRequest(require('./admin'));
exports.api = functions.https.onRequest(require('./api'));