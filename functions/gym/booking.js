const {
  gymsRef,
  appointments,
  firestore,
  firebaseAdmin,
} = require('./firestoreRefs');
const { checkIsBusinessHour } = require('./businessHours');
const { createClientError } = require('../clientError');
const { adminTopic } = require('./fcmTopics');
const { sendFcmToTopic } = require('../sendFcm');

/**
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.userRef
 * @param {import('../firestoreTypes').DocumentReference} params.gymRef
 * @param {Date} params.startAt
 * @param {Date} params.endAt
 */
const createAppointment = async ({ userRef, gymRef, startAt, endAt }) => {
  let onComplete = async () => {};
  if (Date.now() > startAt.getTime() || startAt.getTime() > endAt.getTime()) {
    throw createClientError(400, '請檢查時間是否正確');
  }
  await firestore.runTransaction(async (t) => {
    const gymSnap = await t.get(gymRef);
    if (!gymSnap.exists) {
      throw createClientError(404, '沒有這個場館');
    }
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
      lastUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };
    t.create(gymRef.collection(appointments).doc(), appointment);
    onComplete = async () => {
      const dateFormat = new Intl.DateTimeFormat('zh-hant', {
        weekday: 'narrow',
        month: 'short',
        day: 'numeric',
      });
      const timeFormat = new Intl.DateTimeFormat('zh-hant', {
        hour: '2-digit',
        minute: '2-digit',
      });
      await sendFcmToTopic({
        topic: adminTopic(gymRef),
        content: {
          title: `${dateFormat.format(startAt)})有新的預約`,
          body: `時段為Ｆ${timeFormat.format(startAt)}
          至${timeFormat.format(endAt)}`,
        },
      });
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

/**
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.userRef
 * @param {import('../firestoreTypes').DocumentReference} params.gymRef
 * @param {String} params.appointmentId
 */
const cancelAppointment = async ({ userRef, gymRef, appointmentId }) => {
  let onComplete = async () => {};
  await firestore.runTransaction(async (t) => {
    const snap = await t.get(
      gymRef.collection(appointments).doc(appointmentId)
    );
    if (!snap.exists) {
      throw createClientError(404, '找不到預約');
    }
    /**
     * @type {import('./gym').Appointment}
     */
    const { user, startAt, status } = snap.data();
    if (user.id !== userRef.id) {
      throw createClientError(403, '只能取消自己的預約');
    }
    //TODO: Customize cancel rules
    if (status !== 'scheduled' || Date.now() >= startAt.getTime()) {
      throw createClientError(400, '預約開始後無法取消');
    }
    /**
     * @type {import('./gym').Appointment}
     */
    const update = {
      status: 'cancelled',
      lastUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };
    t.update(snap.ref, update);
    onComplete = async () => {
      const dateFormat = new Intl.DateTimeFormat('zh-hant', {
        weekday: 'narrow',
        month: 'short',
        day: 'numeric',
      });
      const timeFormat = new Intl.DateTimeFormat('zh-hant', {
        hour: '2-digit',
        minute: '2-digit',
      });
      await sendFcmToTopic({
        topic: adminTopic(gymRef),
        content: {
          title: `有人取消${dateFormat.format(startAt)})的預約`,
          body: `時段為${timeFormat.format(startAt)}
          至${timeFormat.format(endAt)}`,
        },
      });
    };
  });
  await onComplete().catch(console.error);
};

module.exports = { createAppointment, cancelAppointment };
