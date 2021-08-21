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
    if ((await checkUserSchedule(t)) === false) {
      throw createClientError(400, '你已經有預約場館');
    }

    if ((await checkGymSchedule(t, { gymRef, startAt, endAt })) === false) {
      throw createClientError(400, '此時段場館已額滿');
    }
    //create appointment
  });
};

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.userRef
 * @param {Date} params.startAt
 * @param {Date} params.endAt
 */
const checkUserSchedule = async (t, { userRef, startAt, endAt }) => {
  const startWithinSnap = await t.get(
    firestore
      .collectionGroup(appointments)
      .where('user', '==', userRef)
      .where('startAt', '>=', startAt)
      .where('startAt', '<=', endAt)
  );
  const endWithinSnap = await t.get(
    firestore
      .collectionGroup(appointments)
      .where('user', '==', userRef)
      .where('endAt', '>=', startAt)
      .where('endAt', '<=', endAt)
  );
  return startWithinSnap.size + endWithinSnap.size === 0;
};

/** @typedef {{date: Date, diff: 1 | -1}} VisitorChange */

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentSnapshot} params.gymSnap
 * @param {Date} params.startAt
 * @param {Date} params.endAt
 */
const checkGymSchedule = async (t, { gymSnap, startAt, endAt }) => {
  /**
   * @type {import('./gym').Gym}
   */
  const { capacity = 1000 } = gymSnap.data();
  const startWithinSnap = await t.get(
    gymSnap.ref
      .collection(appointments)
      .where('startAt', '>=', startAt)
      .where('startAt', '<=', endAt)
  );
  const endWithinSnap = await t.get(
    gymSnap.ref
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
