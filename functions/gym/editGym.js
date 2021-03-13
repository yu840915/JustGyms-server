const { firebaseAdmin } = require('../firestore');
const geofire = require('geofire-common');
const {
  firestore,
  gyms,
  equipmentTypesRef,
  gymsRef,
} = require('./firestoreRefs');
const { findTown } = require('../geoLocation');
const { geocode } = require('../geoLocation');
const { createClientError } = require('../clientError');

/**
 * @param {import('./gym').Gym} gymInfo
 */
const createGym = async (gymInfo) => {
  const { id = null, address, equipments, phones = [] } = gymInfo;
  const gymRef = id ? gymsRef.doc(id) : gymsRef.doc();
  const gymSnap = await gymRef.get();
  if (gymSnap.exists) {
    throw createClientError(409, '此 ID 已被使用');
  }
  let { lat = null, lon = null } = gymInfo;
  if (!lat || !lon) {
    const location = await getLatLonFromAddress(address);
    lat = location.lat;
    lon = location.lng;
  }

  transformEquipmentInput(equipments);
  const geohash = geofire.geohashForLocation([lat, lon]);
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
    lat,
    lon,
    geohash,
    equipmentTypes: [...new Set(equipments.map((e) => e.typeId))],
    phones,
    townId,
    countyId,
  };
  try {
    await gymRef.create(data);
  } catch (error) {
    if (error.code === 6) {
      throw createClientError(409, '此 ID 已被使用');
    }
    throw error;
  }
};

const getLatLonFromAddress = async (address) => {
  const results = await geocode(address);
  if (results.length > 1) {
    throw createClientError(409, `查到 ${results.length} 筆結果`);
  }
  return results[0].geometry.location;
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

/**
 * @param {[String]} images
 */
const setImages = async (gymId, images) => {
  firestore.runTransaction(async (t) => {
    const gymSnap = await t.get(firestore.collection(gyms).doc(gymId));
    if (!gymSnap.exists) {
      throw createClientError(404, '場地不存在');
    }
    /**
     * @type {import('./gym').Gym}
     */
    const update = { images };
    t.update(gymSnap.ref, update);
  });
};

module.exports = {
  createGym,
  updateGym,
  deleteGym,
  setImages,
};
