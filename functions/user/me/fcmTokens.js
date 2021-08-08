const { firebaseAdmin, firestore } = require('../firestoreRefs');
const messaging = require('../../firebaseAdmin').firebaseAdmin.messaging();
const MAX_FCM_TOKENS = 5;
const DEFUALT_TOPICS = ['announcement'];

/**
 * @param {Object} param
 * @param {import('../../firestoreTypes').DocumentReference} param.userRef
 * @param {String} param.token
 */
const addFcmToken = async ({ userRef, token }) => {
  let completion = async () => {};
  await firestore.runTransaction(async (t) => {
    const snap = await t.get(userRef);
    /**
     * @type {import('../user').User}
     */
    let { fcmTokens = [], fcmTopics = [] } = snap.data();
    fcmTokens.push(token);
    if (fcmTokens.length > 5) {
      fcmTokens = fcmTokens.slice(1, 5);
    }
    t.update(userRef, { fcmTokens });
    completion = async () => {
      await subscribeTokensToTopics({
        fcmTokens,
        topics: fcmTopics + DEFUALT_TOPICS,
      });
    };
  });
  await completion();
};

/**
 * @param {Object} param
 * @param {import('../../firestoreTypes').DocumentReference} param.userRef
 * @param {[String]} param.topics
 */
const addTopics = async ({ userRef, topics }) => {
  let completion = async () => {};
  await firestore.runTransaction(async (t) => {
    const snap = await t.get(userRef);
    /**
     * @type {import('../user').User}
     */
    const { fcmTokens = [] } = snap.data();
    /**
     * @type  {import('../user').User}
     */
    const update = {
      fcmTopics: firebaseAdmin.firestore.FieldValue.arrayUnion(topics),
    };
    t.update(userRef, update);
    completion = async () => {
      await subscribeTokensToTopics({ fcmTokens, topics });
    };
  });
  await completion();
};

/**
 * @param {Object} param
 * @param {[String]} param.fcmTokens
 * @param {[String]} param.topics
 */
const subscribeTokensToTopics = async ({ fcmTokens, topics }) => {
  if (fcmTokens.length === 0 || topics.length === 0) {
    return;
  }
  await Promise.all(
    topics.map(
      async (topic) =>
        await messaging.subscribeToTopic(fcmTokens, topic).catch(console.error)
    )
  );
};

/**
 * @param {Object} param
 * @param {import('../../firestoreTypes').DocumentReference} param.userRef
 * @param {[String]} param.topics
 */
const removeTopics = async ({ userRef, topics }) => {
  let completion = async () => {};
  await firestore.runTransaction(async (t) => {
    const snap = await t.get(userRef);
    /**
     * @type {import('../user').User}
     */
    const { fcmTokens = [] } = snap.data();
    /**
     * @type  {import('../user').User}
     */
    const update = {
      fcmTopics: firebaseAdmin.firestore.FieldValue.arrayRemove(topics),
    };
    t.update(userRef, update);
    completion = async () => {
      if (fcmTokens.length === 0 || topics.length === 0) {
        return;
      }
      await Promise.all(
        topics.map(
          async (topic) =>
            await messaging
              .unsubscribeFromTopic(fcmTokens, topic)
              .catch(console.error)
        )
      );
    };
  });
  await completion();
};

module.exports = { addFcmToken, addTopics, removeTopics };
