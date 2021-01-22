const { firestore } = require('../firestore');

const counties = 'counties';
const towns = 'towns';

module.exports = {
  countiesRef: firestore.collection(counties),
  towns,
};
