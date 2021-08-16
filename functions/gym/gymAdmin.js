const {
  addTopicToUserData,
  prepareTopicSubscriptionCompletion,
} = require('../user/me/fcmTokens');
const { changeLogs } = require('./firestoreRefs');
const { firestore } = require('./firestoreRefs');

/**
 * @param {Object} param
 * @param {import('../firestoreTypes').DocumentReference} param.userRef
 * @param {import('../firestoreTypes').DocumentReference} param.gymRef
 */
const addAdmin = async ({ userRef, gymRef }) => {
  let completion = async () => {};
  await firestore.runTransaction(async (t) => {
    completion = prepareTopicSubscriptionCompletion(t, { userRef, topics });
    await addTopicToUserData(t, { userRef, topics });
    //connect user
    //log
  });
  await completion();
};

module.exports = { addAdmin };
