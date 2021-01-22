const firebaseAdmin = require("firebase-admin");

firebaseAdmin.initializeApp();

module.exports = {
  firebaseAdmin,
};
