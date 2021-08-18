const express = require('express');
const validator = require('express-joi-validation').createValidator({});
const validationRules = require('./validationRules');
const { createGym, setImages } = require('./editGym');
const {
  findNearbyGyms,
  findNearbyGymsAndConvertToMapMarkers,
  getGymsByIds,
  getDetail,
} = require('./gymList');
const { addAdmin, removeAdmin } = require('./gymAdmin');
const { getEquipmentTemplateList } = require('./equipmentTemplateList');
const { asyncRequestHandler } = require('../firebaseFunctions');
const {
  generateUploadUrlForGymImage,
  generateDownloadUrlForGymImage,
} = require('./images');
const { gymsRef } = require('./firestoreRefs');

const app = express.Router();

app.post(
  '',
  validator.body(validationRules.createGym),
  asyncRequestHandler(async (req, res) => {
    await createGym(req.body);
    res.sendStatus(201);
  })
);

app.get(
  '',
  validator.query(validationRules.gymList),
  asyncRequestHandler(async (req, res) => {
    const { lat, lon, d, e, sort } = req.query;
    res.send(
      await findNearbyGyms({
        lat,
        lon,
        radiusInM: d,
        equipmentTypes: e,
        sortBy: sort,
      })
    );
  })
);

app.get(
  '/markers',
  validator.query(validationRules.gymMarkers),
  asyncRequestHandler(async (req, res) => {
    const { lat, lon, d, e } = req.query;
    res.send(
      await findNearbyGymsAndConvertToMapMarkers({
        lat,
        lon,
        radiusInM: d,
        equipmentTypes: e,
      })
    );
  })
);

app.get(
  '/equipments',
  asyncRequestHandler(async (req, res) => {
    res.send(await getEquipmentTemplateList());
  })
);

app.get(
  '/:gymId',
  validator.params(validationRules.gymId),
  asyncRequestHandler(async (req, res) => {
    const { gymId } = req.params;
    res.send(await getDetail({ gymId }));
  })
);

app.put(
  '/:gymId/images',
  validator.params(validationRules.gymId),
  validator.body(validationRules.imagesUrls),
  asyncRequestHandler(async (req, res) => {
    const { gymId } = req.params;
    const { images } = req.body;
    await setImages(gymId, images);
    res.sendStatus(200);
  })
);

app.get(
  '/:gymId/images/:imageId',
  validator.params(validationRules.gymId),
  asyncRequestHandler(async (req, res) => {
    const { gymId, imageId } = req.params;
    const url = await generateDownloadUrlForGymImage({
      gymId,
      filename: imageId,
    });
    res.setHeader('Location', url);
    res.sendStatus(302);
  })
);

app.post(
  '/:gymId/images/signed-url',
  validator.params(validationRules.gymId),
  validator.body(validationRules.uploadUrl),
  asyncRequestHandler(async (req, res) => {
    const { gymId } = req.params;
    const { imageId } = req.body;
    const result = await generateUploadUrlForGymImage({
      gymId,
      filename: imageId,
    });
    res.setHeader('Location', result.signedUrl);
    res.send(result);
  })
);

app.put(
  '/:gymId/admins',
  validator.params(validationRules.addAdmin),
  validator.body(validationRules.editAdmin),
  asyncRequestHandler(async (req, res) => {
    const { gymId } = req.params;
    const { user } = req.body;
    await addAdmin({ userRef: user, gymRef: gymsRef.doc(gymId) });
    res.sendStatus(204);
  })
);

app.delete(
  '/:gymId/admins/:user',
  validator.params(validationRules.removeAdmin),
  asyncRequestHandler(async (req, res) => {
    const { gymId, user } = req.params;
    await removeAdmin({ userRef: user, gymRef: gymsRef.doc(gymId) });
    res.sendStatus(204);
  })
);

module.exports = app;
