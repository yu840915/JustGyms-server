const turf = require('@turf/turf');
const { firebaseAdmin } = require('../firestore');
const geofire = require('geofire-common');
const { gymsRef } = require('./firestoreRefs');
const { findNearbyFeaturesInCollection } = require('../geoLocation');
const { formatGymListResult } = require('./formatters');

/**
 * @param {{lat: Number, lon: Number, radiusInM: Number, equipmentTypes?: [Number], sortBy?: 'proximity'| 'price' }
 */
const findNearbyGyms = async ({
  lat,
  lon,
  radiusInM,
  equipmentTypes,
  sortBy = 'proximity',
  formatResults = formatGymListResult,
}) => {
  const snaps = await proximitySearch({ lat, lon, radiusInM });
  let results = [];
  if (equipmentTypes && equipmentTypes.length > 0) {
    for (const snap of snaps) {
      /**
       * @type {import('./gym').Gym}
       */
      const { equipmentTypes: gymEqs = [] } = snap.data();
      const matchedEquipmentTypes = equipmentTypes.filter((e) => {
        return gymEqs.findIndex(e) !== -1;
      });
      if (matchedEquipmentTypes.length > 0) {
        results.push = {
          matchedEquipmentTypes,
          snap,
        };
      }
    }
  } else {
    results = snaps.map((snap) => {
      return {
        snap,
      };
    });
  }
  if (sortBy === 'price') {
    results = sortResultByPrice(results);
  } else {
    results = sortResultByProximity(results, { lat, lon });
  }
  if (formatResults) {
    return formatResults(results);
  }
  return results;
};

/**
 * @param {[{snap: import('../firestoreTypes').DocumentSnapshot}]} result
 */
const sortResultByPrice = (result) => {
  return result.sort((a, b) => {
    /**
     * @type {import('./gym').Gym}
     */
    const { hourlyRate: priceA } = a.snap.data();
    /**
     * @type {import('./gym').Gym}
     */
    const { hourlyRate: priceB } = b.snap.data();
    return priceA.amount - priceB.amount;
  });
};

/**
 * @param {[{snap: import('../firestoreTypes').DocumentSnapshot}]} result
 * @param {{lat: Number, lon: Number}}
 */
const sortResultByProximity = (result, { lat, lon }) => {
  const origin = turf.point([lon, lat]);
  return result.sort((a, b) => {
    /**
     * @type {import('./gym').Gym}
     */
    const gymA = a.snap.data();
    const pointA = turf.point([gymA.lon, gymA.lat]);
    /**
     * @type {import('./gym').Gym}
     */
    const gymB = a.snap.data();
    const pointB = turf.point([gymB.lon, gymB.lat]);
    return (
      turf.distance(origin, pointA, { units: 'meters' }) -
      turf.distance(origin, pointB, { units: 'meters' })
    );
  });
};

/**
 * @param {{lat: Number, lon: Number, radiusInM: Number}}
 */
const proximitySearch = async ({ lat, lon, radiusInM }) => {
  if (!radiusInM) {
    radiusInM = 30 * 1000;
  }
  return await findNearbyFeaturesInCollection({
    collectionRef: gymsRef,
    lat,
    lon,
    radiusInM,
  });
};

module.exports = { findNearbyGyms };
