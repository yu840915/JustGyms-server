const { generateUploadUrl, generateDownloadUrl } = require('../storage');
const { firestore } = require('../firestore');
const { gymsRef } = require('./firestoreRefs');
const { createClientError } = require('../clientError');

const generateUploadUrlForGymImage = async ({ gymId, filename }) => {
  const gymSnap = await gymsRef.doc(gymId).get();
  if (!gymSnap.exists) {
    throw createClientError(404, '健身房不存在');
  }
  if (!filename) {
    filename = firestore.doc().id;
  }
  const signedUrl = await generateUploadUrl({
    collection: `gymImages/${gymId}`,
    filename,
  });
  const path = `/gymImages/${gymId}/images/filename`;
  return {
    signedUrl,
    path,
  };
};

const generateDownloadUrlForGymImage = async ({ gymId, filename }) => {
  return await generateDownloadUrl({
    collection: `gymImages/${gymId}`,
    filename,
  });
};

module.exports = {
  generateUploadUrlForGymImage,
  generateDownloadUrlForGymImage,
};
