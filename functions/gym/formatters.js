/**
 * @param {[{snap: import('../firestoreTypes').QueryDocumentSnapshot}]} results
 */
const formatGymListResult = (results) => {
  return results.map((e) => formatGymSnap(e.snap));
};

/**
 * @param {import('../firestoreTypes').QueryDocumentSnapshot} snap
 */
const formatGymSnap = (snap) => {
  /**
   * @type {import('./gym').Gym}
   */
  const {
    images,
    name,
    lat,
    lon,
    address,
    equipments,
    equipmentTypes,
    businessHours,
    pricing = [],
    hourlyRate,
    phones,
    facilities,
    admins = [],
  } = snap.data();
  return {
    images,
    id: snap.id,
    name,
    lat,
    lon,
    address,
    equipments: equipments.map(formatEquipments),
    equipmentTypes,
    businessHours,
    pricing,
    hourlyRate,
    phones,
    facilities,
    supportsBooking: admins.length > 0,
  };
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
  formatGymSnap,
};
