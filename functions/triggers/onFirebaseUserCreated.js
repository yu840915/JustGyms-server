const { functions } = require('../firebaseFunctions');
const user = require('../user');
const { createUserFromFirebaseUser } = require('../user');

module.exports = functions.auth.user().onCreate(createUserFromFirebaseUser);
