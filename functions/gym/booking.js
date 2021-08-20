const { gymsRef, events, firestore } = require('./firestoreRefs');
const { checkIsBusinessHour } = require('./businessHours');

/**
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.userRef
 * @param {import('../firestoreTypes').DocumentReference} params.gymRef
 * @param {Date} params.startAt
 * @param {Date} params.endAt
 */
const book = async ({ userRef, gymRef, startAt, endAt }) => {
  await firestore.runTransaction(async (t) => {
    const gymSnap = await t.get(gymRef);
    /**
     * @type {import('./gym').Gym}
     */
    const { businessHours } = gymSnap.data();
    const isBusinessHour =
      checkIsBusinessHour({ date: startAt, businessHours }) &&
      checkIsBusinessHour({ date: startAt, businessHours });

    //check gym's schedule
    //check user's schedule
    //create appointment
  });
};

module.exports = { book };
