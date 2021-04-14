const firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp({ storageBucket: 'where-gym.appspot.com' });

module.exports = {
  firebaseAdmin,
};
