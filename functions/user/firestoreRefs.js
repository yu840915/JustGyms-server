const { firestore } = require('../firestore');

module.exports = {
  firestore,
  usersRef: firestore.collection('users'),
};
