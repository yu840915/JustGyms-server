/**
 * @param {import('../firestoreTypes').DocumentReference} gymRef
 */
const adminTopic = (gymRef) => `${gymRef.id}-admin`;

module.exports = { adminTopic };
