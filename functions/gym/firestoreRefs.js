const { firestore } = require('../firestore');

const equipmentCategories = 'equipmentCategories';
const equipmentTypes = 'equipmentTypes';
const equipmentTemplates = 'equipmentTemplates';

module.exports = {
  firestore,
  equipmentCategoriesRef: firestore.collection(equipmentCategories),
  equipmentTypes,
  equipmentTemplates,
};
