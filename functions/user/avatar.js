const { createClientError } = require('../clientError');
const { generateUploadUrl, generateDownloadUrl } = require('../storage');

/**
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.user
 * @param {String} params.mime
 */
const generateUploadUrlForAvatar = async ({ user, mime }) => {
  const userSnap = await user.get();
  if (!userSnap.exists) {
    return createClientError(404, '找不到此使用者');
  }
  return generateUploadUrl({
    mime,
    collection: `users/${user.id}`,
    filename: 'avatar',
  });
};

/**
 * @param {String} userId
 * @returns
 */
const generateDownloadUrlForAvatar = async ({ userId }) => {
  return await generateDownloadUrl({
    collection: `users/${userId}`,
    filename: 'avatar',
  });
};

module.exports = { generateUploadUrlForAvatar, generateDownloadUrlForAvatar };
