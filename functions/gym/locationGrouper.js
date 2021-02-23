const turf = require('@turf/turf');

const groupGyms = ({ gyms, lat, lon, distanceInM }) => {
  //find bbox
  const bbox = turf.bbox(
    turf.circle([lon, lat], distanceInM, { units: 'meters', steps: 4 })
  );
  //form hex grids
  const grids = turf.hexGrid(bbox, Math.max(distanceInM / 10, 30), {
    units: 'meters',
  });
  //group
  // 1. find cell
  // 2. determine center point
  // 3. remove empty
};

module.exports = {
  groupGyms,
};
