const { usersRef, firebaseAdmin, firestore } = require('../firestoreRefs');
const MAX_FCM_TOKENS = 5;

/**
 * @param {Object} param
 * @param {import('../../firestoreTypes').DocumentReference} param.userRef
 * @param {String} param.token
 */
const addFcmToken = async ({ userRef, token }) => {
  await firestore.runTransaction(async (t) => {
    const snap = await t.get(userRef);
    /**
     * @type {import('../user').User}
     */
    let { fcmTokens = [] } = snap.data();
    fcmTokens.push(token);
    if (fcmTokens.length > 5) {
      fcmTokens = fcmTokens.slice(1, 5);
    }
    t.update(userRef, { fcmTokens });
  });
};
module.exports = { addFcmToken };
