const { log } = require('firebase-functions/lib/logger');
const { functions } = require('./firebaseFunctions');
// const { initEquipmentTemplates } = require('./gym/initGyms');
const { geocode } = require('./geoLocation');

module.exports = functions.pubsub.schedule('00 00 * * *').onRun(async () => {
  await geocode('台北市松山區南京東路四段13巷3-1');
});
