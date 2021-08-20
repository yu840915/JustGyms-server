const { gymsRef, appointments, firestore } = require('./firestoreRefs');
const { checkIsBusinessHour } = require('./businessHours');
const { createClientError } = require('../clientError');

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
    if (!isBusinessHour) {
      throw createClientError(400, '請選擇場館開放時間');
    }
    if (!checkGymSchedule(t, { gymRef, startAt, endAt })) {
      throw createClientError(400, '此時段場館已額滿');
    }
    //check gym's schedule
    //check user's schedule
    //create appointment
  });
};

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentSnapshot} params.gymSnap
 * @param {Date} params.startAt
 * @param {Date} params.endAt
 *
 */
const checkGymSchedule = async (t, { gymSnap, startAt, endAt }) => {
  /**
   * @type {import('./gym').Gym}
   */
  const { capacity = 1000 } = gymSnap.data();
  const startWithinSnap = await t.get(
    gymRef
      .collection(appointments)
      .where('startAt', '>=', startAt)
      .where('startAt', '<=', endAt)
  );
  const endWithinSnap = await t.get(
    gymRef
      .collection(appointments)
      .where('endAt', '>=', startAt)
      .where('endAt', '<=', endAt)
  );
  if (startWithinSnap.size + endWithinSnap.size + 1 < capacity) {
    return true;
  }
  //TODO: Go through start end and check max concurrency start +1 end -1
  //like that [start, end ,start ...]
};

module.exports = { book };
