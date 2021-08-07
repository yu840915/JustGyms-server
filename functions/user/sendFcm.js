const messaging = require('../firebaseAdmin').firebaseAdmin.messaging();

/**
 * @param {Object} param
 * @param {import('../firestoreTypes').DocumentReference} param.userRef
 * @param {import('./fcm').FcmMessageContent} param.content
 */
const sendFcm = async ({ userRef, content }) => {
  const snap = await userRef.get();
  /**
   * @type {import('./user').User}
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
 * @param {import('./fcm').FcmMessageContent} content
 */
const createMessageFromContent = (content) => {
  /**
   * @type {import('./fcm').FcmMessage}
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

module.exports = { sendFcm };
