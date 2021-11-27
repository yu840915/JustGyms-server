const { firebaseAdmin } = require('../firebaseAdmin');
const { request } = require('gaxios');
const { usersRef } = require('../user/firestoreRefs');

/**
 * Firebase user log-in with email and password.
 * @param {String} email
 * @param {String} password
 * @returns {String} auth token
 */
async function logInWithEmailPassword(email, password) {
  const id = await getUserIdWithEmailPassword(email, password);
  if (!id) return null;
  const claims = await generateCustomClaimsForUser(id);
  const customToken = await firebaseAdmin.auth().createCustomToken(id, claims);
  return await exchangeForIdToken(customToken);
}

async function getUserIdWithEmailPassword(email, password) {
  try {
    const res = await request({
      url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
      method: 'POST',
      params: { key: configs.firebaseIdToolkitKey },
      data: { email: email, password: password, returnSecureToken: false },
    });
    if (!res.data) return null;
    const { localId } = res.data;
    return localId;
  } catch (error) {
    if (error.code === '400') {
      console.warn(`[Auth] User failed sign in with email password, ${email}`);
      return null;
    }
    throw error;
  }
}

async function generateCustomClaimsForUser(id) {
  const user = await usersRef.doc(id).get();
  const { roles } = user.data();
  if (!roles || roles.length === 0) return {};
  return { roles };
}

async function exchangeForIdToken(customToken) {
  const res = await request({
    url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken',
    method: 'POST',
    params: { key: configs.firebaseIdToolkitKey },
    data: { token: customToken, returnSecureToken: true },
  });
  if (!res.data) return null;
  return res.data.idToken;
}

module.exports = {
  logInWithEmailPassword,
};
