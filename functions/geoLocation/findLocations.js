const geofire = require('geofire-common');
const { countiesRef, towns } = require('./firestoreRefs');
const turf = require('@turf/turf');

/**
 * @param {{lat: number, lon: number}}
 */
const findCounty = async ({ lat, lon }) => {
  const radiusInM = 30 * 1000;

  const bounds = geofire.geohashQueryBounds([lat, lon], radiusInM);
  const queries = [];
  for (const bound of bounds) {
    queries.push(
      countiesRef.orderBy('geohash').startAt(bound[0]).endAt(bound[1]).get()
    );
  }
  const counties = await Promise.all(queries).then((snaps) => {
    return findFeaturesContainingCoord({ snaps, lat, lon });
  });
  return counties;
};

/**
 * @type {{snaps: import('../firestore').QuerySnapshot, lat: number, lon: number}}
 */
const findFeaturesContainingCoord = ({ snaps, lat, lon }) => {
  const points = turf.points([[lon, lat]]);
  const retVals = [];
  for (const snap of snaps) {
    for (const docSnap of snap.docs) {
      const { geojson } = docSnap.data();
      const feature = JSON.parse(geojson);
      if (turf.pointsWithinPolygon(points, feature).features.length > 0) {
        retVals.push(feature);
      }
    }
  }
  return retVals;
};

/**
 * @param {{lat: Number, lon: Number, collectionRef: import('../firestoreTypes').CollectionReference, radiusInM: Number}}
 */
const findNearbyFeaturesInCollection = async ({
  collectionRef,
  lat,
  lon,
  radiusInM,
}) => {
  const bounds = geofire.geohashQueryBounds([lat, lon], radiusInM);
  const queries = [];
  for (const bound of bounds) {
    queries.push(
      collectionRef.orderBy('geohash').startAt(bound[0]).endAt(bound[1]).get()
    );
  }
  const features = await Promise.all(queries).then((snaps) => {
    return filterNearbyFeatures({ snaps, lat, lon, radiusInM });
  });
  return features;
};

/**
 * @param {{snaps: import('../firestoreTypes').QuerySnapshot[], lat: Number, lon: Number, radiusInM: Number}}
 */
const filterNearbyFeatures = ({ snaps, lat, lon, radiusInM }) => {
  const origin = turf.point([lon, lat]);
  const features = [];

  for (const snap of snaps) {
    /**
     * @type {GeoLocation}
     */
    for (const docSnap of snap.docs) {
      const { lat, lon } = docSnap.data();
      const pt = turf.point([lon, lat]);
      if (turf.distance(origin, pt, { units: 'meters' }) < radiusInM) {
        features.push(docSnap);
      }
    }
  }
  return features;
};

module.exports = { findCounty, findNearbyFeaturesInCollection };
