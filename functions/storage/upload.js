const { firebaseAdmin } = require('../firebaseAdmin');
const storage = firebaseAdmin.storage();
const bucket = storage.bucket();
const { min } = require('../dateConstants');
const { request } = require('gaxios');
const uuid = require('uuid').v4;

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
  console.log(`Will generate signed url for ${ref.name}`);
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

/**
 * @param {import('firebase-functions/lib/providers/storage').ObjectMetadata} object
 */
const updateVisibility = async (object) => {
  const firebaseStorageDownloadTokens = uuid();
  const ref = storage.bucket(object.bucket).file(object.name);
  console.log(`Will update metadata for ${ref.name}`);
  await ref.acl.add({ entity: 'allUsers', role: 'READER' });
  await ref.setMetadata({
    cacheControl: 'public,max-age=3600',
    metadata: { firebaseStorageDownloadTokens },
  });
  console.log(
    `Did update metadata for ${ref.name}`
  );
};

module.exports = { generateUploadUrl, updateVisibility };
