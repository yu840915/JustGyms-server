const { firestore } = require('./firestoreRefs');
const { appointments, gymsRef } = require('../gym/firestoreRefs');
const { createClientError } = require('../clientError');
const { sendFcmToTopic } = require('../sendFcm');
const { adminTopic } = require('../gym/fcmTopics');

/**
 * @param {import('../firestoreTypes').DocumentReference} userRef
 */
const deleteUser = async (userRef) => {
  const completions = [];
  await firestore.runTransaction(async (t) => {
    const userSnap = await t.get(userRef);
    if (userSnap.exists) {
      throw createClientError(404, '找不到使用者');
    }
    const appointmentSnaps = await getAppointments(t, userRef);
    const gymSnaps = await getManagingGyms(t, userRef);
    completions.concat(cancelAppointments(t, appointmentSnaps, userRef));
  });
  //Remove admin
  //Remove user
  //Remove firebase user
};

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {import('../firestoreTypes').DocumentReference} userRef
 */
const getAppointments = async (t, userRef) => {
  return await t.get(
    firestore
      .collectionGroup(appointments)
      .where('user', '==', userRef)
      .where('status', '==', 'scheduled')
      .orderBy('startAt', 'desc')
  );
};

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {import('../firestoreTypes').DocumentReference} userRef
 */
const getManagingGyms = async (t, userRef) => {
  return await t.get(gymsRef.where('admins', 'array-contains', userRef));
};

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {import('../firestoreTypes').QuerySnapshot} snaps
 * @param {import('../firestoreTypes').DocumentReference} userRef
 */
const cancelAppointments = (t, snaps, userRef) => {
  const dateFormat = new Intl.DateTimeFormat('zh-hant', {
    weekday: 'narrow',
    month: 'short',
    day: 'numeric',
  });
  const timeFormat = new Intl.DateTimeFormat('zh-hant', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const update = {
    status: 'cancelled',
    lastUpdatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    cancelledBy: userRef,
  };
  const completions = [];
  for (const snap of snaps.docs) {
    /** @type {import('../gym/gym').Appointment} */
    const { gym, startAt, endAt } = snap.data();
    t.update(snap.ref, update);
    const completion = async () => {
      await sendFcmToTopic({
        topic: adminTopic(gym),
        content: {
          title: `有人取消${dateFormat.format(startAt.toDate())})的預約`,
          body: `時段為${timeFormat.format(startAt.toDate())}
              至${timeFormat.format(endAt.toDate())}`,
        },
      });
    };
    completions.push(completion);
  }
  return completions;
};

module.exports = {
  deleteUser,
};
