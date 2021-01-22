const fs = require('fs');
const geofire = require('geofire-common');
const turf = require('@turf/turf');
const { firestore } = require('../firestore');
const { countiesRef, towns } = require('./firestoreRefs');

const updateCounties = async () => {
  const data = await readFile('twcounty2010.5.json');
  const { features } = JSON.parse(data);
  const batch = firestore.batch();
  for (const feature of features) {
    const { county_id: countyId, county } = feature.properties;
    const countyRef = countiesRef.doc(`${countyId}`);
    const pointOfFeature = turf.pointOnFeature(feature, { countyId, county });
    feature.properties = { countyId, county };
    const [lon, lat] = pointOfFeature.geometry.coordinates;
    const geohash = geofire.geohashForLocation([lat, lon]);
    batch.set(countyRef, {
      lon,
      lat,
      countyId,
      county,
      geohash,
      geojson: JSON.stringify(feature),
    });
  }
  await batch.commit();
};

const updateTowns = async () => {
  const data = await readFile('twtown2010.5.json');
  /**
   * @type {{features: [any]}}
   */
  const { features } = JSON.parse(data);
  const batches = [];
  let batch = firestore.batch();
  let counter = 0;
  let total = 0;
  for (const feature of features) {
    total++;
    counter++;
    const {
      county_id: countyId,
      county,
      town_id: townId,
      town,
    } = feature.properties;
    const countyRef = countiesRef.doc(`${countyId}`);
    const townRef = countyRef.collection(towns).doc(townId);
    const pointOfFeature = turf.pointOnFeature(feature, { countyId, county });
    feature.properties = { countyId, county, town, townId };
    const [lon, lat] = pointOfFeature.geometry.coordinates;
    const geohash = geofire.geohashForLocation([lat, lon]);
    batch.set(townRef, {
      lon,
      lat,
      countyRef,
      countyId,
      county,
      townId,
      town,
      geohash,
      geojson: JSON.stringify(feature),
    });
    if (counter > 30) {
      counter = 0;
      batches.push(batch);
      batch = firestore.batch();
    }
  }
  console.log(`Will add ${total} towns`);
  await Promise.all(
    batches.map(async (batch) => await batch.commit().catch(console.log))
  );
  console.log(`Did add ${total} towns`);
};

/**
 * @param {String} relPath
 */
const readFile = async (relPath) => {
  return new Promise((resolve, rejects) => {
    fs.realpath([__dirname, relPath].join('/'), (err, absPath) => {
      if (err) {
        return rejects(err);
      }
      return fs.readFile(absPath, (err, data) => {
        if (err) {
          return rejects(err);
        }
        return resolve(data);
      });
    });
  });
};

module.exports = {
  updateCounties,
  updateTowns,
};
