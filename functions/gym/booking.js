const {
  gymsRef,
  appointments,
  firestore,
  firebaseAdmin,
} = require('./firestoreRefs');
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
  let onComplete = async () => {};
  await firestore.runTransaction(async (t) => {
    const gymSnap = await t.get(gymRef);
    /**
     * @type {import('./gym').Gym}
     */
    const { businessHours, admins = [] } = gymSnap.data();
    if (admins.length === 0) {
      throw createClientError(400, '此場館還沒有預約功能');
    }
    const isBusinessHour =
      checkIsBusinessHour({ date: startAt, businessHours }) &&
      checkIsBusinessHour({ date: startAt, businessHours });
    if (!isBusinessHour) {
      throw createClientError(400, '請選擇場館開放時間');
    }
    if ((await checkUserSchedule(t, { userRef, startAt, endAt })) === false) {
      throw createClientError(400, '你已經有預約場館');
    }
    if ((await checkGymSchedule(t, { gymRef, startAt, endAt })) === false) {
      throw createClientError(400, '此時段場館已額滿');
    }

    /** @type {import('./gym').Appointment} */
    const appointment = {
      user: userRef,
      startAt,
      endAt,
      status: 'scheduled',
      type: 'reservation',
      gym: gymRef,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };
    t.create(gymRef.collection(appointments).doc(), appointment);
    onComplete = async () => {
      //Send fcm to admins of gyms
    };
  });
  await onComplete().catch(console.error);
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
  const snaps = startWithinSnap.docs.concat(endWithinSnap.docs);
  /** @type {[{date: Date, diff: 1 | -1}]} */
  const visitorEvents = [];
  const processed = {};
  for (const snap of snaps) {
    if (processed[snap.ref.id]) {
      continue;
    }
    processed[snap.ref.id] = true;
    /**
     * @type {import('./gym').Appointment}
     */
    const { startAt, endAt } = snap.data();
    visitorEvents.push({
      date: startAt,
      diff: 1,
    });
    visitorEvents.push({
      date: endAt,
      diff: -1,
    });
  }
  visitorEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  let concurrentVisitors = 0;
  for (const event of visitorEvents) {
    concurrentVisitors += event.diff;
    if (concurrentVisitors >= capacity) {
      return false;
    }
  }
  return true;
};

module.exports = { book };
