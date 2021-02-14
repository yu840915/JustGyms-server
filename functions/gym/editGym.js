const { firebaseAdmin } = require('../firestore');
const geofire = require('geofire-common');
const { firestore, gyms, equipmentTypesRef } = require('./firestoreRefs');
const { findTown } = require('../geoLocation');

/**
 * @param {import('./gym').Gym} gymInfo
 */
const createGym = async (gymInfo) => {
  const { lat, lon, equipments } = gymInfo;

  transformEquipmentInput(equipments);
  const geohash = geofire.geohashForLocation([lat, lon]);
  const gymRef = firestore.collection(gyms).doc();
  const town = await findTown({ lat, lon });
  /**
   *  @type {import('../geoLocation/location').TownProperties}
   */
  const { townId, countyId } = town.properties;

  /**
   * @type {import('./gym').Gym}
   */
  const data = {
    ...gymInfo,
    geohash,
    equipmentTypes: [...new Set(equipments.map((e) => e.typeId))],
    townId,
    countyId,
  };
  await gymRef.create(data);
};

/**
 * @param {[import('./gym').Equipments]} input
 */
const transformEquipmentInput = (input) => {
  for (const item of input) {
    item.type = equipmentTypesRef.doc(`${item.typeId}`);
  }
};

/**
 * @param {{gymId: String, gymInfo: import('./gym').Gym}}
 */
const updateGym = async ({ gymId, gymInfo }) => {
  firestore.runTransaction(async (t) => {
    const gymSnap = await t.get(firestore.collection(gyms).doc(gymId));
    if (!gymSnap.exists) {
      throw Error;
    }
    const { lat, lon, equipments } = gymInfo;
    if (lat && lon) {
      gymInfo.geohash = geofire.geohashForLocation([lat, lon]);
    }
    if (equipments) {
      gymInfo.equipmentTypes = [...new Set(equipments.map((e) => e.typeId))];
    }
    t.update(gymSnap.ref, gymInfo);
  });
};

const deleteGym = async ({ gymId }) => {
  firestore.runTransaction(async (t) => {
    const gymSnap = await t.get(firestore.collection(gyms).doc(gymId));
    if (!gymSnap.exists) {
      throw Error;
    }
    t.delete(gymSnap.ref);
  });
};

module.exports = {
  createGym,
  updateGym,
  deleteGym,
};
