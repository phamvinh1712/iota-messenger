const isString = require('lodash/isString');

const serialise = (data, ...options) => {
  if (!isString(data)) {
    return JSON.stringify(data, ...options);
  }

  return data;
};

const parse = data => {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
};

const removeNonAlphaNumeric = (source, fallback = '') => {
  let newStr = '';
  if (source) {
    newStr = source.replace(/[^a-zA-Z0-9_-]/g, '');
  }
  if (!newStr && fallback) {
    newStr = fallback.replace(/[^a-zA-Z0-9_-]/g, '');
  }
  return newStr;
};

module.exports = {
  removeNonAlphaNumeric,
  parse,
  serialise
};
