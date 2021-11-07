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
    if (fcmTokens.indexOf(token) === -1) {
      fcmTokens.push(token);
    }
    if (fcmTokens.length > 5) {
      fcmTokens = fcmTokens.slice(1, 5);
    }
    t.update(userRef, { fcmTokens });
    completion = async () => {
      await subscribeTokensToTopics({
        fcmTokens,
        topics: fcmTopics.concat(DEFUALT_TOPICS),
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
    completion = await prepareTopicSubscriptionCompletion(t, {
      userRef,
      topics,
    });
    addTopicsToUserData(t, { userRef, topics });
  });
  await completion();
};

/**
 * @param {import('../../firestoreTypes').Transaction} t
 * @param {Object} param
 * @param {import('../../firestoreTypes').DocumentReference} param.userRef
 * @param {[String]} param.topics
 */
const addTopicsToUserData = (t, { userRef, topics }) => {
  /**
   * @type  {import('../user').User}
   */
  const update = {
    fcmTopics: firebaseAdmin.firestore.FieldValue.arrayUnion(...topics),
  };
  t.update(userRef, update);
};

/**
 * @param {import('../../firestoreTypes').Transaction} t
 * @param {Object} param
 * @param {import('../../firestoreTypes').DocumentReference} param.userRef
 * @param {[String]} param.topics
 */
const prepareTopicSubscriptionCompletion = async (t, { userRef, topics }) => {
  const snap = await t.get(userRef);
  /**
   * @type {import('../user').User}
   */
  const { fcmTokens = [] } = snap.data();
  return async () => {
    await subscribeTokensToTopics({ fcmTokens, topics });
  };
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
    completion = await prepareTopicUnsubscriptionCompletion(t, {
      userRef,
      topics,
    });
    removeTopicsFromUserData(t, { userRef, topics });
  });
  await completion();
};

/**
 * @param {import('../../firestoreTypes').Transaction} t
 * @param {Object} param
 * @param {import('../../firestoreTypes').DocumentReference} param.userRef
 * @param {[String]} param.topics
 */
const removeTopicsFromUserData = (t, { userRef, topics }) => {
  /**
   * @type  {import('../user').User}
   */
  const update = {
    fcmTopics: firebaseAdmin.firestore.FieldValue.arrayRemove(...topics),
  };
  t.update(userRef, update);
};
/**
 * @param {import('../../firestoreTypes').Transaction} t
 * @param {Object} param
 * @param {import('../../firestoreTypes').DocumentReference} param.userRef
 * @param {[String]} param.topics
 */
const prepareTopicUnsubscriptionCompletion = async (t, { userRef, topics }) => {
  const snap = await t.get(userRef);
  /**
   * @type {import('../user').User}
   */
  const { fcmTokens = [] } = snap.data();
  return async () => {
    await unsubscribeTokensFromTopics({ fcmTokens, topics });
  };
};
/**
 * @param {Object} param
 * @param {[String]} param.fcmTokens
 * @param {[String]} param.topics
 */
const unsubscribeTokensFromTopics = async ({ fcmTokens, topics }) => {
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

module.exports = {
  addFcmToken,
  addTopics,
  removeTopics,
  addTopicsToUserData,
  prepareTopicSubscriptionCompletion,
  removeTopicsFromUserData,
  prepareTopicUnsubscriptionCompletion,
  unsubscribeTokensFromTopics,
};
