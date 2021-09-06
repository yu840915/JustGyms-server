const {
  gymsRef,
  appointments,
  firestore,
  firebaseAdmin,
} = require('./firestoreRefs');
const { min } = require('../dateConstants');
const { sendFcm } = require('../sendFcm');

const remindForNearAppointments = async () => {
  const now = Date.now();
  const start = Date(now + 28 * min);
  const end = Date(now + 31 * min);

  let cursor;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let notifications = [];
    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line no-loop-func
    const exit = await firestore.runTransaction(async (t) => {
      let query = firestore
        .collectionGroup(appointments)
        .where('status', '==', 'scheduled')
        .where('startAt', '>=', start)
        .where('startAt', '<=', end);
      if (cursor) {
        query = query.startAfter(cursor);
      }
      const snaps = await t.get(query.limit(10));
      if (snaps.empty) {
        return true;
      }
      for (const snap of snaps.docs) {
        cursor = snap;
        /** @type {import('./gym').Appointment} */
        const { hasReminded, user, gymName, gym } = snap.data();
        if (hasReminded) {
          continue;
        }
        /** @type {{userRef: import('../firestoreTypes').DocumentReference, content: import('../user/fcm').FcmMessageContent}} */
        const notification = {
          userRef: user,
          content: {
            title: `你預約${gymName}的時間將於30分鐘後開始`,
            data: { gym: gym.id, id: snap.id },
          },
        };
        notifications.push(notification);
        /** @type {import('./gym').Appointment} */
        const update = { hasReminded: true };
        t.update(snap.ref, update);
      }
      return false;
    });
    /* eslint-disable no-await-in-loop */
    await Promise.all(notifications.map(async (e) => sendFcm(e)));
    if (exit) {
      break;
    }
  }
};

module.exports = { remindForNearAppointments };
