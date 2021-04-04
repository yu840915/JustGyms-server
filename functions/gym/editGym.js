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
  const {
    id = null,
    address,
    equipments,
    phones = [],
    pricing,
    businessHours,
  } = gymInfo;
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
    hourlyRate: lowestHourlyRate(pricing),
    businessHours: parseBusinessHours(businessHours),
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

/**
 * @param {[import('./gym').BusinessHours]} businessHours
 */
const parseBusinessHours = (businessHours) => {
  if (!businessHours || businessHours.length === 0) {
    return null;
  }
  /**
   * @type {import('./gym').BusinessHours}
   */
  let base;
  const specialCases = {};

  for (const descriptor of businessHours) {
    if (!descriptor.dayOfWeek) {
      base = descriptor;
    } else {
      specialCases[descriptor.dayOfWeek.toLowerCase()] = descriptor;
    }
  }

  if (!base && Object.keys(specialCases).length !== 7) {
    throw createClientError(
      400,
      'Please specify base case or business hours for every weekday'
    );
  }

  const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  /**
   * @type {[import('./gym').BusinessHours]}
   */
  const retVals = weekdays.map((e) => {
    const val = specialCases[e] || base;
    /**
     * @type {import('./gym').BusinessHours}
     */
    const ret = { ...val, dayOfWeek: e };
    return ret;
  });
  return retVals;
};

/**
 * @param {[import('./gym').Fare]} pricing
 * @returns
 */
const lowestHourlyRate = (pricing) => {
  if (!pricing || pricing.length === 0) {
    return null;
  }
  /**
   * @type {import('./gym').Price}
   */
  let min;
  for (const fare of pricing) {
    const rate = estimateHourlyRate(fare);
    if (!min || min.amount > rate.amount) {
      min = rate;
    }
  }
  return min;
};

/**
 * @param {import('./gym').Fare} fare
 */
const estimateHourlyRate = (fare) => {
  let hour = 1;
  if (fare.unit === 'hour') {
    hour = fare.amount;
  } else if (fare.unit === 'time') {
    hour = 3;
  } else if (fare.unit === 'day') {
    if (fare.amount < 7) {
      hour = 3 * fare.amount;
    } else {
      hour = 3 * 0.5 * fare.amount;
    }
  } else if (fare.unit === 'min') {
    hour = fare.amount / 60;
  }
  /**
   * @type {import('./gym').Price}
   */
  const price = {
    amount: Math.round(fare.price.amount / hour),
    currency: fare.price.currency,
  };
  return price;
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
