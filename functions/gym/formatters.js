/**
 * @param {[{snap: import('../firestoreTypes').QueryDocumentSnapshot}]} results
 */
const formatGymListResult = (results) => {
  return results.map((e) => {
    const { snap } = e;
    /**
     * @type {import('./gym').Gym}
     */
    const {
      name,
      lat,
      lon,
      address,
      equipments,
      equipmentTypes,
      businessHours,
      hourlyRate,
    } = snap.data();
    return {
      id: snap.id,
      name,
      lat,
      lon,
      address,
      equipments: equipments.map(formatEquipments),
      equipmentTypes,
      businessHours,
      hourlyRate,
    };
  });
};

/**
 * @param {import('./gym').Equipments} equipments
 */
const formatEquipments = (equipments) => {
  const { typeId, name, number } = equipments;
  return { typeId, name, number };
};

module.exports = {
  formatEquipments,
  formatGymListResult,
};
