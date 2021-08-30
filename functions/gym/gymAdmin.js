const {
  addTopicsToUserData,
  prepareTopicSubscriptionCompletion,
  removeTopicsFromUserData,
  prepareTopicUnsubscriptionCompletion,
} = require('../user/me/fcmTokens');
const { changeLogs } = require('./firestoreRefs');
const { firestore, firebaseAdmin } = require('./firestoreRefs');
const { adminTopic } = require('./fcmTopics');

/**
 * @param {Object} param
 * @param {import('../firestoreTypes').DocumentReference} param.userRef
 * @param {import('../firestoreTypes').DocumentReference} param.gymRef
 */
const addAdmin = async ({ userRef, gymRef }) => {
  let completion = async () => {};
  const topics = [adminTopic(gymRef)];
  await firestore.runTransaction(async (t) => {
    completion = await prepareTopicSubscriptionCompletion(t, {
      userRef,
      topics,
    });
    addTopicsToUserData(t, { userRef, topics });
    /**
     * @type {import('./gym').Gym}
     */
    const gymUpdate = {
      admins: firebaseAdmin.firestore.FieldValue.arrayUnion(userRef),
    };
    /**
     * @type {import('./gym').ChangeLog}
     */
    const logUpdate = {
      date: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      type: 'adminAdded',
      user: userRef,
    };
    t.update(gymRef, gymUpdate);
    t.create(gymRef.collection(changeLogs).doc(), logUpdate);
  });
  await completion();
};

/**
 * @param {Object} param
 * @param {import('../firestoreTypes').DocumentReference} param.userRef
 * @param {import('../firestoreTypes').DocumentReference} param.gymRef
 */
const removeAdmin = async ({ userRef, gymRef }) => {
  let completion = async () => {};
  const topics = [adminTopic(gymRef)];
  await firestore.runTransaction(async (t) => {
    completion = await prepareTopicUnsubscriptionCompletion(t, {
      userRef,
      topics,
    });
    removeTopicsFromUserData(t, { userRef, topics });
    /**
     * @type {import('./gym').Gym}
     */
    const gymUpdate = {
      admins: firebaseAdmin.firestore.FieldValue.arrayRemove(userRef),
    };
    /**
     * @type {import('./gym').ChangeLog}
     */
    const logUpdate = {
      date: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      type: 'adminRemoved',
      user: userRef,
    };
    t.update(gymRef, gymUpdate);
    t.create(gymRef.collection(changeLogs).doc(), logUpdate);
  });
  await completion();
};

module.exports = { addAdmin, removeAdmin };
