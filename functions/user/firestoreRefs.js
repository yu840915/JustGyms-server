const { firebaseAdmin, firestore } = require('../firestore');

module.exports = {
  firebaseAdmin,
  firestore,
  usersRef: firestore.collection('users'),
  favoritesRef: firestore.collection('favorites'),
};
