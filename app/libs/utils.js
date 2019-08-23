// const get = require('lodash/get');
// const size = require('lodash/size');
// const isArray = require('lodash/isArray');
// const isObject = require('lodash/isObject');
// const map = require('lodash/map');
// const reduce = require('lodash/reduce');
const isString = require('lodash/isString');
// const keys = require('lodash/keys');
// const filter = require('lodash/filter');
// const transform = require('lodash/transform');
// const validUrl = require('valid-url');

// export const TWOFA_TOKEN_LENGTH = 6;
//
// export function round(value, precision) {
//   const multiplier = Math.pow(10, precision || 0);
//   return Math.round(value * multiplier) / multiplier;
// }
//
// export function roundDown(number, decimals) {
//   decimals = decimals || 0;
//   return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
// }
//
//
// const _renameObjectKeys = (object, keyMap) =>
//   reduce(
//     object,
//     (result, value, key) => {
//       const k = keyMap[key] || key;
//       result[k] = value;
//       return result;
//     },
//     {},
//   );
//
// const _renameArrayKeys = (list, keyMap) => map(list, (object) => _renameObjectKeys(object, keyMap));
//
// export const renameKeys = (payload, keyMap) => {
//   if (isArray(payload)) {
//     return _renameArrayKeys(payload, keyMap);
//   }
//
//   return _renameObjectKeys(payload, keyMap);
// };
//
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
//
//
// export const rearrangeObjectKeys = (obj, prop) => {
//   if (prop in obj) {
//     const allKeys = keys(obj);
//     const withoutProp = filter(allKeys, (k) => k !== prop);
//     const withPropAsLastEl = withoutProp.concat([prop]);
//
//     const order = (newObj, key) => {
//       newObj[key] = obj[key];
//
//       return newObj;
//     };
//
//     return reduce(withPropAsLastEl, order, {});
//   }
//
//   return obj;
// };
//
// export function getUrlTimeFormat(timeframe) {
//   switch (timeframe) {
//     case '24h':
//       return 'hour';
//     case '7d':
//       return 'day';
//     case '1m':
//       return 'day';
//     case '1h':
//       return 'minute';
//   }
// }
//
//
// export function getUrlNumberFormat(timeframe) {
//   switch (timeframe) {
//     case '24h':
//       return '23';
//     case '7d':
//       return '6';
//     case '1m':
//       return '29';
//     case '1h':
//       return '59';
//   }
// }
//
// export function formatChartData(json, timeframe) {
//   const timeValue = getUrlNumberFormat(timeframe);
//   const response = get(json, 'Data');
//   const hasDataPoints = size(response);
//   const failedData = [];
//
//   if (response && isArray(response) && hasDataPoints) {
//     const data = [];
//     for (let i = 0; i <= timeValue; i++) {
//       const y = get(response, `[${i}].close`);
//       data[i] = {
//         x: i,
//         y: parseFloat(y),
//         time: get(response, `[${i}].time`),
//       };
//     }
//
//     return data;
//   }
//
//   return failedData;
// }
//
//
// export const isValidUrl = (url) => {
//   if (validUrl.isWebUri(url)) {
//     return true;
//   }
//   return false;
// };
//
// export const isValidHttpsUrl = (url) => {
//   if (validUrl.isHttpsUri(url)) {
//     return true;
//   }
//   return false;
// };
//
// /**
//  *   Find most frequently occurring element in a list.
//  *   NOTE: Only supports booleans, strings
//  *
//  *   @method findMostFrequent
//  *   @param {array} list
//  *   @returns {object} - Frequency and most frequent element
//  **/
// export const findMostFrequent = (list) =>
//   transform(
//     list,
//     (acc, value) => {
//       acc.frequency[value] = (acc.frequency[value] || 0) + 1;
//
//       if (!acc.frequency[acc.mostFrequent] || acc.frequency[value] > acc.frequency[acc.mostFrequent]) {
//         acc.mostFrequent = value;
//       }
//     },
//     { frequency: {}, mostFrequent: '' },
//   );
//
// /* Converts RGB to Hex.
//  *
//  * @method rgbToHex
//  * @param {string} Rgb as string
//  *
//  * @returns {String}
//  */
// export const rgbToHex = (c) => {
//   const convert = (x) =>
//     '#' +
//     x
//       .map((x) => {
//         const hex = x.toString(16);
//         return hex.length === 1 ? '0' + hex : hex;
//       })
//       .join('');
//   c = c
//     .split('(')[1]
//     .split(')')[0]
//     .split(', ')
//     .map(Number);
//   return convert(c);
// };
//
// /**
//  * Replaces all non alpha numeric (plus _ and -) characters for an empty string
//  *
//  * @method removeNonAlphaNumeric
//  * @param {string} source - String with non ASCII chars to be cleansed
//  * @param {string} fallback - Optional string to be returned in the event of a falsy source
//  *
//  * @returns {string} Returns a new string without non ASCII characters
//  */
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
