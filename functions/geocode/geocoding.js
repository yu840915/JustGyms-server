const { request } = require('gaxios');
const { api_key: apiKey } = require('firebase-functions').config().main_service;
const { createClientError } = require('../clientError');

const geocode = async (address) => {
  const res = await request({
    url: 'https://maps.googleapis.com/maps/api/geocode/json',
    method: 'GET',
    params: {
      key: apiKey,
      address,
    },
  });
  if (res.status !== 200) {
    throw new Error('無法解析地址');
  }
  /**
   * @type {import('./geocode').GeocodeResponse}
   */
  const { status, results = [] } = res.data;
  if (status !== 'OK' || results.length === 0) {
    console.error(res.data);
    throw createClientError(400, '請檢查地址是否正確');
  }
  results.forEach((e) => console.log(e.geometry.location));
  return results;
};

module.exports = {
  geocode,
};
