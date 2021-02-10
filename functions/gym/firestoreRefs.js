const { firestore } = require('../firestore');

const gyms = 'gyms';
const equipmentCategories = 'equipmentCategories';
const equipmentTypes = 'equipmentTypes';
const equipmentTemplates = 'equipmentTemplates';

module.exports = {
  firestore,
  equipmentCategoriesRef: firestore.collection(equipmentCategories),
  equipmentTypes,
  equipmentTemplates,
  gyms,
};
