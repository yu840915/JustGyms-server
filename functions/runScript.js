const { log } = require('firebase-functions/lib/logger');
const { functions } = require('./firebaseFunctions');
// const { initEquipmentTemplates } = require('./gym/initGyms');
const { findNearbyGyms } = require('./gym/gymList');
const { groupGyms } = require('./gym/locationGrouper');

module.exports = functions.pubsub.schedule('00 00 * * *').onRun(async () => {
  const gyms = await findNearbyGyms({
    lat: 25.109966,
    lon: 121.474611,
    distanceInM: 30000,
  });  
  groupGyms({ gyms, lat: 25.109966, lon: 121.474611, distanceInM: 30000 });
});
