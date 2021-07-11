const { firestore, usersRef } = require('./firestoreRefs');

/**
 * @param {import('firebase-admin').auth.UserRecord} firebaseUser
 */
const createUserFromFirebaseUser = async (firebaseUser) => {
  if (firebaseUser.providerData.length === 0) {
    console.log('Anonymous user, skip');
    return;
  }
  const ref = usersRef.doc(firebaseUser.uid);
  /**
   * @type {import('./user').User}
   */
  const user = {
    name: firebaseUser.displayName || null,
    cover: firebaseUser.photoURL || null,
  };
  await firestore.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (snap.exists) {
      return;
    }
    t.create(ref, user);
  });
};

module.exports = {
  createUserFromFirebaseUser,
};
