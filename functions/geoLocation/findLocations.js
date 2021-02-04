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

module.exports = { findCounty };
