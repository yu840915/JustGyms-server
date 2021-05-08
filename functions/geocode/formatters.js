/**
 * @param {import('./geocode').GeocodeResult} item
 */
const formatAddressSearchResult = (item) => {
  const { formatted_address: address, geometry } = item;
  return { address, geometry };
};

module.exports = { formatAddressSearchResult };
