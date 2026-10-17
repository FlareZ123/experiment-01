'use strict';

const { createHash } = require('node:crypto');
// Exact Python 3.12 str.isspace() code points for action-name validity.
const PYTHON_ACTION_WHITESPACE = new Set([9,10,11,12,13,28,29,30,31,32,133,160,5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8232,8233,8239,8287,12288]);


/**
 * Reject lone UTF-16 surrogates, which Python's UTF-8 serializer cannot encode.
 * @param {string} value
 */
function requireUnicodeScalarString(value) {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new TypeError('Unpaired high surrogate in action trace');
      }
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError('Unpaired low surrogate in action trace');
    }
  }
}

/**
 * Match Python's Unicode code-point ordering, not JS UTF-16 .sort().
 * @param {string} first
 * @param {string} second
 * @returns {number}
 */
function compareCodePoints(first, second) {
  const a = Array.from(first, char => char.codePointAt(0));
  const b = Array.from(second, char => char.codePointAt(0));
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return Math.sign(a.length - b.length);
}

/**
 * @param {unknown} value
 * @param {Set<object>} ancestors
 * @returns {string}
 */
function encode(value, ancestors) {
  if (value === null) return 'null';
  if (typeof value === 'string') {
    requireUnicodeScalarString(value);
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new TypeError('Trace numbers must be portable exact integers');
    }
    return JSON.stringify(value);
  }
  if (typeof value !== 'object') {
    throw new TypeError('Unsupported action trace JSON value');
  }
  if (ancestors.has(value)) throw new TypeError('Cyclic action trace');
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('Trace values must be plain JSON objects');
  }
  if (Object.getOwnPropertySymbols(value).length) {
    throw new TypeError('Trace objects cannot contain symbol keys');
  }
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new TypeError('Sparse action trace arrays are invalid');
        }
      }
      if (Object.getOwnPropertyNames(value).length !== value.length + 1) {
        throw new TypeError('Action trace arrays cannot have extra properties');
      }
      return '[' + value.map(item => encode(item, ancestors)).join(',') + ']';
    }
    const keys = Object.keys(value).sort(compareCodePoints);
    if (Object.getOwnPropertyNames(value).length !== keys.length) {
      throw new TypeError('Trace objects cannot contain hidden keys');
    }
    return '{' + keys.map(key => {
      requireUnicodeScalarString(key);
      return JSON.stringify(key) + ':' + encode(value[key], ancestors);
    }).join(',') + '}';
  } finally {
    ancestors.delete(value);
  }
}

/**
 * Canonical UTF-8-compatible representation of the Python verifier's event
 * list. All events require a zero-based sequential step and an action name.
 * @param {unknown} trace
 * @returns {string}
 */
function canonicalActionTrace(trace) {
  if (!Array.isArray(trace) || !trace.length) {
    throw new TypeError('action_trace must be a nonempty list');
  }
  trace.forEach((event, index) => {
    if (!event || Array.isArray(event) || typeof event !== 'object' ||
        !Object.hasOwn(event, 'step') || !Object.hasOwn(event, 'action') ||
        event.step !== index || !Number.isInteger(event.step) ||
        typeof event.action !== 'string' || !Array.from(event.action).some(char => !PYTHON_ACTION_WHITESPACE.has(char.codePointAt(0)))) {
      throw new TypeError('Trace events need sequential steps and action names');
    }
  });
  return encode(trace, new Set());
}

/**
 * @param {unknown} trace
 * @returns {string}
 */
function actionTraceSha256(trace) {
  return createHash('sha256').update(canonicalActionTrace(trace), 'utf8').digest('hex');
}

module.exports = { canonicalActionTrace, actionTraceSha256, compareCodePoints };
