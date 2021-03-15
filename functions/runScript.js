const { functions } = require('./firebaseFunctions');
// const { initEquipmentTemplates } = require('./gym/initGyms');
const { findCounty } = require('./geoLocation');

module.exports = functions.pubsub.schedule('00 00 * * *').onRun(async () => {
  const county = await findCounty({ lat: 25.052472, lon: 121.549954 });
  console.log(county);  
});
