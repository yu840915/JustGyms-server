const { gymsRef, events, firestore } = require('./firestoreRefs');

/**
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.userRef
 * @param {import('../firestoreTypes').DocumentReference} params.gymRef
 * @param {Date} params.startAt
 * @param {Date} params.endAt
 */
const book = async ({ userRef, gymRef, startAt, endAt }) => {
  await firestore.runTransaction(async (t) => {
    //get gym and check open hour

    //check gym's schedule
    //check user's schedule
    //create appointment
  });
};

module.exports = { book };
