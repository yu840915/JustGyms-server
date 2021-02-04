const { log } = require('firebase-functions/lib/logger');
const { functions } = require('./firebaseFunctions');
const { initEquipmentType } = require('./gym/initGyms');

module.exports = functions.pubsub.schedule('00 00 * * *').onRun(async () => {
  await initEquipmentType();
});
