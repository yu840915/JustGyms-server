const { createClientError } = require('../clientError');
const { usersRef, firestore, firebaseAdmin } = require('../user/firestoreRefs');

/**
 * @param {Object} params
 * @param {String} params.userId
 * @param {[import('../user/user').Role]} params.roles
 */
const addUserRoles = async ({ userId, roles }) => {
  /** @type {import('../user/user').User} */
  const update = {
    roles: firebaseAdmin.firestore.FieldValue.arrayUnion(...roles),
  };
  try {
    await usersRef.doc(userId).update(update);
  } catch (error) {
    if (error.code === 5) {
      throw createClientError(404, '沒有此使用者');
    }
    throw error;
  }
};

const removeUserRoles = async ({ userId, roles }) => {
  /** @type {import('../user/user').User} */
  const update = {
    roles: firebaseAdmin.firestore.FieldValue.arrayRemove(...roles),
  };
  try {
    await usersRef.doc(userId).update(update);
  } catch (error) {
    if (error.code === 5) {
      throw createClientError(404, '沒有此使用者');
    }
    throw error;
  }
};

module.exports = {
  addUserRoles,
  removeUserRoles,
};
