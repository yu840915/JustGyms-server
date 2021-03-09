const { firebaseAdmin } = require('../firebaseAdmin');
const bucket = firebaseAdmin.storage().bucket();
const { min } = require('../dateConstants');

//Image sizes
/**
 * @param {{mime?: string, collection: string, filename: string}}
 * @returns {string}
 */
const generateUploadUrl = async ({
  mime = 'image/jpeg',
  collection,
  filename,
  expires,
}) => {
  const ref = bucket.file(`${collection}/${filename}`);
  const url = await ref.getSignedUrl({
    action: 'resumable',
    version: 'v4',
    contentType: mime,
    expires: expires || Date.now() + 15 * min,
  });
  return url.length > 0 ? url[0] : null;
};

module.exports = { generateUploadUrl };
