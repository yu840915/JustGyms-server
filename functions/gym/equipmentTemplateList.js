const { equipmentTemplatesRef } = require('./firestoreRefs');
const { formatEquipments } = require('./formatters');

const getEquipmentTemplateList = async () => {
  const snaps = await equipmentTemplatesRef.orderBy('typeId').get();
  return snaps.docs.map((snap) => formatEquipments(snap.data()));
};

module.exports = { getEquipmentTemplateList };
