const { firebaseAdmin } = require('../firebaseAdmin');
const bucket = firebaseAdmin.storage().bucket();
const { day } = require('../dateConstants');
const { createClientError } = require('../clientError');

const generateDownloadUrl = async ({ collection, filename, expires }) => {
  const ref = bucket.file(`${collection}/${filename}`);
  const exists = await ref.exists();
  if (exists.length === 0 || !exists[0]) {
    throw createClientError(404, '圖片不存在');
  }
  const [{ metadata = {}, mediaLink, generation }] = await ref.getMetadata();
  console.log(metadata);
  const { firebaseStorageDownloadTokens } = metadata;
  if (firebaseStorageDownloadTokens) {
    let url = mediaLink;
    if (generation) {
      url = url.replace(`generation=${generation}`, '');
    }
    return url + `&token=${firebaseStorageDownloadTokens}`;
  } else {
    const url = await ref.getSignedUrl({
      action: 'read',
      version: 'v4',
      contentType: mime,
      expires: expires || Date.now() + day,
    });
    return url.length > 0 ? url[0] : null;
  }
};

module.exports = { generateDownloadUrl };
