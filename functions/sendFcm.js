const messaging = require('./firebaseAdmin').firebaseAdmin.messaging();

/**
 * @param {Object} params
 * @param {import('./firestoreTypes').DocumentReference} params.userRef
 * @param {import('./user/fcm').FcmMessageContent} params.content
 */
const sendFcm = async ({ userRef, content }) => {
  const snap = await userRef.get();
  /**
   * @type {import('./user/user').User}
   */
  const { fcmTokens = [] } = snap.data();
  if (!fcmTokens.length) {
    return;
  }
  const message = createMessageFromContent(content);
  if (fcmTokens.length === 1) {
    message.token = fcmTokens[0];
    await messaging.send(message);
  } else {
    message.tokens = fcmTokens;
    await messaging.sendMulticast(message);
  }
};

/**
 * @param {Object} params
 * @param {String} params.topic
 * @param {import('./user/fcm').FcmMessageContent} params.content
 */
const sendFcmToTopic = async ({ topic, content }) => {
  const message = createMessageFromContent(content);
  await messaging.sendToTopic(topic, message);
};

/**
 * @param {import('./user/fcm').FcmMessageContent} content
 */
const createMessageFromContent = (content) => {
  /**
   * @type {import('./user/fcm').FcmMessage}
   */
  const message = {
    notification: {
      title: content.title,
      body: content.body,
    },
  };
  if (content.data) {
    message.data = content.data;
  }
  return message;
};

module.exports = { sendFcm, sendFcmToTopic };
