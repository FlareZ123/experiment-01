'use strict';

const {createHash} = require('node:crypto');

/** @param {unknown} value @returns {string} */
function canonicalJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value))) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const keys = Object.keys(value).sort();
    if (keys.some(k => value[k] === undefined)) throw new TypeError('Undefined evidence values');
    return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
  }
  throw new TypeError('Evidence must be plain, finite JSON');
}

/** @param {unknown} value @returns {string} */
function sha256(value) {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

/** @param {object} bundle @returns {string} */
function evidenceBundleSha256(bundle) {
  return sha256(bundle);
}

module.exports = {canonicalJson, evidenceBundleSha256};
