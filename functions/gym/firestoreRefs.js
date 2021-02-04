const { firestore } = require('../firestore');

const equipmentCategories = 'equipmentCategories';
const equipmentTypes = 'equipmentTypes';

module.exports = {
  firestore,
  equipmentCategoriesRef: firestore.collection(equipmentCategories),
  equipmentTypes,
};
