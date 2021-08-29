const {
  gymsRef,
  appointments,
  firestore,
  firebaseAdmin,
} = require('./firestoreRefs');
const {
  checkIsBusinessHour,
  parseBusinessHours,
  convertHhmm,
} = require('./businessHours');
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
  //TODO: Customize last booking time
  if (Date.now() >= startAt.getTime() || startAt.getTime() >= endAt.getTime()) {
    throw createClientError(400, '請檢查時間是否正確');
  }
  const appointmentId = await firestore.runTransaction(async (t) => {
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
      checkIsBusinessHour({ date: endAt, businessHours });
    if (!isBusinessHour) {
      throw createClientError(400, '請選擇場館開放時間');
    }
    if ((await checkUserSchedule(t, { userRef, startAt, endAt })) === false) {
      throw createClientError(400, '你已經有預約場館');
    }
    if ((await checkGymSchedule(t, { gymSnap, startAt, endAt })) === false) {
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
    const appointmentRef = gymRef.collection(appointments).doc();
    t.create(appointmentRef, appointment);
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
    return appointmentRef.id;
  });
  await onComplete().catch(console.error);
  return appointmentId;
};

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.userRef
 * @param {Date} params.startAt
 * @param {Date} params.endAt
 */
const checkUserSchedule = async (t, { userRef, startAt, endAt }) => {
  const neighborSnap = await t.get(
    firestore
      .collectionGroup(appointments)
      .where('user', '==', userRef)
      .where('status', '==', 'scheduled')
      .where('startAt', '<=', endAt)
      .orderBy('startAt', 'desc')
      .limit(1)
  );
  if (neighborSnap.empty) {
    return true;
  }
  /** @type {import('./gym').AppointmentSnap} */
  const { endAt: neighborEndAt } = neighborSnap.docs[0].data();
  //Overlapping at endpoints is allowed
  return startAt.getTime() >= neighborEndAt.toMillis();
};

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentSnapshot} params.gymSnap
 * @param {Date} params.startAt
 * @param {Date} params.endAt
 */
const checkGymSchedule = async (t, { gymSnap, startAt, endAt }) => {
  /** @type {import('./gym').Gym} */
  const { capacity = 1000 } = gymSnap.data();
  /** @type {import('./gym').Gym} */
  let { businessHours } = gymSnap.data();
  businessHours = parseBusinessHours(businessHours);
  const hours = businessHours[startAt.getDay() - 1];
  const gymStart = new Date(startAt.toDateString());
  const startTime = convertHhmm(hours.start);
  gymStart.setHours(startTime.hour - 8);
  gymStart.setMinutes(startTime.min);
  const gymEnd = new Date(startAt.toDateString());
  const endTime = convertHhmm(hours.end);
  gymEnd.setHours(endTime.hour - 8);
  gymEnd.setMinutes(endTime.min);

  const appointmentsSnaps = await t.get(
    gymSnap.ref
      .collection(appointments)
      .where('status', '==', 'scheduled')
      .where('startAt', '>=', gymStart)
      .where('startAt', '<=', gymEnd)
  );
  if (appointmentsSnaps.size + 1 < capacity) {
    return true;
  }

  /** @type {[{date: Date, diff: 1 | -1}]} */
  const visitorEvents = [];
  for (const snap of appointmentsSnaps.docs) {
    /** @type {import('./gym').AppointmentSnap} */
    const { startAt: startAtTs, endAt: endAtTs } = snap.data();
    if (
      startAtTs.toMillis() >= endAt.getTime() ||
      endAtTs.toMillis() <= startAt.getTime()
    ) {
      continue;
    }
    visitorEvents.push({
      date: startAtTs.toDate(),
      diff: 1,
    });
    visitorEvents.push({
      date: endAtTs.toDate(),
      diff: -1,
    });
  }
  visitorEvents.sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    //Overlapping at endpoints is allowed, deduction first
    return a.diff - b.diff;
  });
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
     * @type {import('./gym').AppointmentSnap}
     */
    const { user, startAt, endAt, status } = snap.data();
    if (user.id !== userRef.id) {
      throw createClientError(403, '只能取消自己的預約');
    }
    //TODO: Customize cancel rules
    if (status !== 'scheduled' || Date.now() >= startAt.toMillis()) {
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
          title: `有人取消${dateFormat.format(startAt.toDate())})的預約`,
          body: `時段為${timeFormat.format(startAt.toDate())}
          至${timeFormat.format(endAt.toDate())}`,
        },
      });
    };
  });
  await onComplete().catch(console.error);
};

module.exports = { createAppointment, cancelAppointment };
