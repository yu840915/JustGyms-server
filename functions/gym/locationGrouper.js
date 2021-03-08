const turf = require('@turf/turf');

/**
 * @param {{gyms: [import('./gym').Gym], lat: Number, lon: Number, radiusInM: Number}}
 */
const groupGyms = ({ gyms, lat, lon, radiusInM }) => {
  const features = gyms.map((gym) => turf.point([gym.lon, gym.lat], gym));
  const grids = getHexGrids({ lat, lon, radiusInM });
  for (const feature of features) {
    const idx = grids.findIndex((grid) =>
      turf.pointsWithinPolygon([feature], grid)
    );
    if (idx === -1) {
      continue;
    }
    const grid = grids[idx];
    /**
     * @type {[any]}
     */
    const features = grid.properties.features;
    features.push(feature);
  }

  /**
   * @type {[import('@turf/turf').FeatureCollection]}
   */
  const collections = [];
  for (const grid of grids) {
    const collection = formCollectionFromGrid(grid);
    if (collection) {
      collections.push(collection);
    }
  }
  return turf.featureCollection(collections);
};

/**
 * @param {import('@turf/turf').Feature} grid
 */
const formCollectionFromGrid = (grid) => {
  /**
   * @type {[import('@turf/turf').Feature]}
   */
  const features = grid.properties.features;
  /**
   * @type {import('@turf/turf').Feature}
   */
  const gridCenter = grid.properties.center;
  if (features.length === 0) {
    return null;
  }
  features.sort(
    (a, b) => turf.distance(a, gridCenter) - turf.distance(b, gridCenter)
  );
  return turf.point(
    turf.getCoord(features[0]),
    turf.featureCollection(features)
  );
};

/**
 * @param {{lat: Number, lon: Number, radiusInM: Number}}
 */
const getHexGrids = ({ lat, lon, radiusInM }) => {
  const bbox = turf.bbox(
    turf.circle([lon, lat], radiusInM, { units: 'meters', steps: 4 })
  );
  const grids = turf.hexGrid(bbox, Math.max(radiusInM / 10, 30), {
    units: 'meters',
  }).features;

  for (const grid of grids) {
    grid.properties.center = turf.center(grid);
    grid.properties.features = [];
  }
  return grids;
};

module.exports = {
  groupGyms,
};
