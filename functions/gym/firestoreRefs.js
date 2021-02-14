const { firestore } = require('../firestore');

const gyms = 'gyms';
const equipmentCategories = 'equipmentCategories';
const equipmentTypes = 'equipmentTypes';
const equipmentTemplates = 'equipmentTemplates';

module.exports = {
  firestore,
  equipmentCategoriesRef: firestore.collection(equipmentCategories),
  equipmentTypesRef: firestore.collection(equipmentTypes),
  equipmentTemplatesRef: firestore.collection(equipmentTemplates),
  gymsRef: firestore.collection(gyms),
  gyms,
};
