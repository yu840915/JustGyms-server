const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * @param {Object} param
 * @param {Date} param.date
 * @param {[import('./gym').BusinessHours]} param.businessHours
 */
const checkIsBusinessHour = ({ date, businessHours }) => {
  businessHours = parseBusinessHours(businessHours);
  const targetDayHours = businessHours[date.getDay()];

  const start = convertHhmm(targetDayHours.start);
  const startDate = new Date(date.toDateString());
  startDate.setHours(start.hour);
  startDate.setMinutes(start.min);
  const end = convertHhmm(targetDayHours.end);
  const endDate = new Date(date.toDateString());
  endDate.setHours(end.hour);
  endDate.setMinutes(end.min);
  return (
    startDate.getTime() <= date.getTime() && endDate.getTime() >= date.getTime()
  );
};

/**
 * @param {String} hhmm
 */
const convertHhmm = (hhmm) => {
  const comps = hhmm.split(':');
  return {
    hour: Number.parseInt(comps[0]),
    min: Number.parseInt(comps[1]),
  };
};

/**
 * @param {[import('./gym').BusinessHours]} businessHours
 */
const parseBusinessHours = (businessHours) => {
  if (!businessHours || businessHours.length === 0) {
    return null;
  }
  /**
   * @type {import('./gym').BusinessHours}
   */
  let base;
  const specialCases = {};

  for (const descriptor of businessHours) {
    if (!descriptor.dayOfWeek) {
      base = descriptor;
    } else {
      specialCases[descriptor.dayOfWeek.toLowerCase()] = descriptor;
    }
  }

  if (!base && Object.keys(specialCases).length !== 7) {
    throw createClientError(
      400,
      'Please specify base case or business hours for every weekday'
    );
  }

  /**
   * @type {[import('./gym').BusinessHours]}
   */
  const retVals = weekdays.map((e) => {
    const val = specialCases[e] || base;
    /**
     * @type {import('./gym').BusinessHours}
     */
    const ret = { ...val, dayOfWeek: e };
    return ret;
  });
  return retVals;
};

module.exports = { parseBusinessHours, checkIsBusinessHour, convertHhmm };
