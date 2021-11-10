const { firestore } = require('./firestoreRefs');
const { appointments, gymsRef } = require('../gym/firestoreRefs');
const { createClientError } = require('../clientError');
const { sendFcmToTopic } = require('../sendFcm');
const { adminTopic } = require('../gym/fcmTopics');
const { unsubscribeTokensFromTopics } = require('./me/fcmTokens');
const { firebaseAdmin } = require('../firebaseAdmin');
const { auth } = require('firebase-admin');

/**
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.userRef
 * @param {auth.UserRecord} params.user
 */
const deleteUser = async ({ userRef, user }) => {
  if (userRef) {
    await deleteRealUser(userRef);
  } else {
    await deleteAnonymousUser(user);
  }
};

/**
 * @param {import('../firestoreTypes').DocumentReference} userRef
 */
const deleteRealUser = async (userRef) => {
  const completions = [async () => {}];
  await firestore.runTransaction(async (t) => {
    const userSnap = await t.get(userRef);
    if (userSnap.exists) {
      throw createClientError(404, '找不到使用者');
    }
    /** @type {import('./user').User} */
    const { fcmTokens = [] } = userSnap.data();
    const appointmentSnaps = await getAppointments(t, userRef);
    const gymSnaps = await getManagingGyms(t, userRef);
    completions.concat(cancelAppointments(t, appointmentSnaps, userRef));
    completions.concat(removeAdmin(t, appointmentSnaps, userRef, fcmTokens));
    t.delete(userRef);
  });
  await firebaseAdmin.auth().deleteUser(userRef.id);
  await Promise.all(
    completions.map(async (completion) => {
      await completion().catch(console.error);
    })
  );
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

/**
 * @param {import('../firestoreTypes').Transaction} t
 * @param {import('../firestoreTypes').QuerySnapshot} snaps
 * @param {import('../firestoreTypes').DocumentReference} userRef
 * @param {[String]} fcmTokens
 */
const removeAdmin = (t, snaps, userRef, fcmTokens) => {
  const completions = [];
  for (const snap of snaps.docs) {
    const gymRef = snap.ref;
    const topics = [adminTopic(gymRef)];
    let completion = async () => {
      await unsubscribeTokensFromTopics({ fcmTokens, topics });
    };
    completions.push(completion);
    /** @type {import('./gym').Gym} */
    const gymUpdate = {
      admins: firebaseAdmin.firestore.FieldValue.arrayRemove(userRef),
    };
    /** @type {import('./gym').ChangeLog} */
    const logUpdate = {
      date: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      type: 'adminRemoved',
      user: userRef,
    };
    t.update(gymRef, gymUpdate);
    t.create(gymRef.collection(changeLogs).doc(), logUpdate);
  }
  return completions;
};

/**
 * @param {auth.UserRecord} user
 */
const deleteAnonymousUser = async (user) => {
  if (user.providerData.length !== 0) {
    throw createClientError(400, 'This user is not anonymous');
  }
  await firebaseAdmin.auth().deleteUser(anonymousId);
};

/**
 * @param {String} userId
 */
const deleteAnonymousUserWithId = async (userId) => {
  const user = await firebaseAdmin.auth().getUser(userId);
  if (!user) {
    throw createClientError(404, '使用者不存在');
  }
  await deleteAnonymousUser(user);
};

module.exports = {
  deleteAnonymousUserWithId,
  deleteAnonymousUser,
  deleteUser,
};
