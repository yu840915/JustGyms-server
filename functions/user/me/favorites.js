const { firebaseAdmin, favoritesRef } = require('../firestoreRefs');

/**
 * @param {{user: import('../../firestoreTypes').DocumentReference, gymIds: [String]}}
 */
const addGyms = async (user, { gymIds }) => {
  const ref = favoritesRef.doc(user.id);
  /**
   * @type {import('../user').Favorites}
   */
  const update = {
    user,
    gyms: firebaseAdmin.firestore.FieldValue.arrayUnion(gymIds),
  };
  await ref.set(update, { merge: true });
};

/**
 * @param {{user: import('../../firestoreTypes').DocumentReference, gymIds: [String]}}
 */
const removeGyms = async (user, { gymIds }) => {
  const ref = favoritesRef.doc(user.id);
  /**
   * @type {import('../user').Favorites}
   */
  const update = {
    gyms: firebaseAdmin.firestore.FieldValue.arrayRemove(gymIds),
  };
  await ref.set(update, { merge: true });
};

const getGyms = async (user) => {
  const snap = await favoritesRef.doc(user.id).get();
  if (!snap.exists) {
    return [];
  }
  /**
   * @type {import('../user').Favorites}
   */
  const { gyms } = snap.data();
  return gyms || [];
};

module.exports = {
  addGyms,
  removeGyms,
  getGyms,
};
