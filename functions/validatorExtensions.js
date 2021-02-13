const Joi = require('joi');

/**
 * @type {{stringArray: () => Joi.ArraySchema}}
 */
const CSVArray = Joi.extend((joi) => {
  return {
    type: 'stringArray',
    base: joi.array(),
    coerce: function (value) {
      const ret = value.split ? value.split(',') : value;
      return { value: ret };
    },
  };
});

module.exports = { CSVArray };
