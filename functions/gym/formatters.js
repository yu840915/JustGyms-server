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
      phones,
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
      phones,
    };
  });
};

/**
 * @param {import('./gym').Equipments} equipments
 */
const formatEquipments = (equipments) => {
  /**
   * @type {import('./gym').Weights}
   */
  const { typeId, name, number, max, min } = equipments;
  /**
   * @type {import('./gym').Weights}
   */
  const val = { typeId, name, number };
  if (typeof max === 'number') {
    val.max = max;
  }
  if (typeof min === 'number') {
    val.min = min;
  }
  return val;
};

module.exports = {
  formatEquipments,
  formatGymListResult,
};
