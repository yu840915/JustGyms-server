const { firebaseAdmin } = require("./firebaseAdmin");

const firestore = firebaseAdmin.firestore();

module.exports = {
  firestore,
  firebaseAdmin,
};
