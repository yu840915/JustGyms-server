const {
  addTopicToUserData,
  prepareTopicSubscriptionCompletion,
} = require('../user/me/fcmTokens');
const { changeLogs } = require('./firestoreRefs');
const { firestore, firebaseAdmin } = require('./firestoreRefs');

/**
 * @param {Object} param
 * @param {import('../firestoreTypes').DocumentReference} param.userRef
 * @param {import('../firestoreTypes').DocumentReference} param.gymRef
 */
const addAdmin = async ({ userRef, gymRef }) => {
  let completion = async () => {};
  await firestore.runTransaction(async (t) => {
    const gymSnap = t.get(gymRef);
    completion = prepareTopicSubscriptionCompletion(t, { userRef, topics });
    await addTopicToUserData(t, { userRef, topics });
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

module.exports = { addAdmin };
