const { firebaseAdmin } = require('../firebaseAdmin');
const bucket = firebaseAdmin.storage().bucket();
const { min } = require('../dateConstants');
const { request } = require('gaxios');

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
  console.log(`Will generate signed url for ${ref}`);
  const url = await ref.getSignedUrl({
    action: 'resumable',
    version: 'v4',
    contentType: mime,
    expires: expires || Date.now() + 15 * min,
  });
  if (url.length === 0) {
    return null;
  }
  const res = await request({
    url: url[0],
    method: 'POST',
    headers: { 'Content-Type': mime, 'x-goog-resumable': 'start' },
  });
  if (res.status !== 201) {
    return null;
  }
  return res.headers.location;
};

module.exports = { generateUploadUrl };
