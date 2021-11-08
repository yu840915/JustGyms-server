module.exports = {
  ...require('./createUser'),
  ...require('../sendFcm'),
  routes: require('./routes'),
  firestoreRefs: require('./firestoreRefs'),
};
