const { generateUploadUrl, generateDownloadUrl } = require('../storage');
const { firestore } = require('../firestore');
const { gymsRef } = require('./firestoreRefs');
const { createClientError } = require('../clientError');

/**
 * @param {Object} params
 * @param {import('../firestoreTypes').DocumentReference} params.user
 * @param {String} params.gymId
 * @param {String} params.filename
 * @returns
 */
const generateUploadUrlForGymImage = async ({ user, gymId, filename }) => {
  const gymSnap = await gymsRef.doc(gymId).get();
  if (!gymSnap.exists) {
    throw createClientError(404, '健身房不存在');
  }
  /** @type {import('./gym').Gym} */
  const { admins } = gymSnap.data();
  if (admins.findIndex((admin) => admin.id === user.id) === -1) {
    throw createClientError(403, '沒有存取權限');
  }
  if (!filename) {
    filename = firestore.doc().id;
  }
  const signedUrl = await generateUploadUrl({
    collection: `gyms/${gymId}/images`,
    filename,
  });
  const path = `/gyms/${gymId}/images/${filename}`;
  return {
    signedUrl,
    path,
  };
};

const generateDownloadUrlForGymImage = async ({ gymId, filename }) => {
  return await generateDownloadUrl({
    collection: `gyms/${gymId}/images`,
    filename,
  });
};

module.exports = {
  generateUploadUrlForGymImage,
  generateDownloadUrlForGymImage,
};
