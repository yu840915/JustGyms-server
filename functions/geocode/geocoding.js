const { request } = require('gaxios');
const { api_key: apiKey } = require('firebase-functions').config().main_service;
const { createClientError } = require('../clientError');

const geocode = async (address, { language, country }) => {
  const params = {
    key: apiKey,
    address,
  };
  if (language) {
    params.language = language;
  }
  if (country) {
    country.components = `country:${country}`;
  }
  const res = await request({
    url: 'https://maps.googleapis.com/maps/api/geocode/json',
    method: 'GET',
    params,
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
  return results;
};

const addressSearch = async ({
  address,
  country = 'TW',
  language = 'zh-TW',
}) => {
  return await geocode(address, { country, language });
};

module.exports = {
  geocode,
  addressSearch,
};
