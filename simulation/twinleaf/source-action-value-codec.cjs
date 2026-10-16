'use strict';

/** Versioned encoding for a restricted subset of real Action own fields. */
const SCHEMA = 'action-values-v1';

/** @param {unknown} x @param {Set<object>} seen */
function encode(x, seen = new Set()) {
  if (x === undefined) return ['u'];
  if (x === null) return ['z'];
  if (typeof x === 'string') return ['s', x];
  if (typeof x === 'boolean') return ['b', x];
  if (typeof x === 'number' && Number.isSafeInteger(x)) {
    return Object.is(x, -0) ? ['minus-zero'] : ['n', x];
  }
  if (!x || typeof x !== 'object') throw new TypeError('Unsupported action value');
  if (seen.has(x)) throw new TypeError('Repeated object identity cannot be replayed');
  seen.add(x);
  if (Object.getOwnPropertySymbols(x).length) throw new TypeError('Symbol key');
  if (Array.isArray(x)) {
    if (Object.getOwnPropertyNames(x).length !== x.length + 1 ||
        !Object.getOwnPropertyDescriptor(x, 'length').writable) {
      throw new TypeError('Nonstandard array');
    }
    return ['a', Array.from({length:x.length}, (_, i) => {
      const d = Object.getOwnPropertyDescriptor(x, String(i));
      if (!d || !Object.hasOwn(d, 'value') || !d.enumerable ||
          !d.writable || !d.configurable) throw new TypeError('Nonstandard array slot');
      return encode(d.value, seen);
    })];
  }
  const p = Object.getPrototypeOf(x);
  if (p !== null && p !== Object.prototype) {
    throw new TypeError('Class instance requires prompt-reference resolver');
  }
  return ['o', p === null, fields(x, seen)];
}

/** @param {object} x @param {Set<object>} seen */
function fields(x, seen) {
  return Object.getOwnPropertyNames(x).map(k => {
    const d = Object.getOwnPropertyDescriptor(x, k);
    if (!Object.hasOwn(d, 'value')) throw new TypeError('Accessor property');
    return [k, d.enumerable, d.configurable, d.writable, encode(d.value, seen)];
  });
}

/** @param {unknown} x */
function captureAction(x) {
  if (!x || typeof x !== 'object' || !x.constructor?.name ||
      Object.getPrototypeOf(x) !== x.constructor.prototype) {
    throw new TypeError('Expected a direct Action instance');
  }
  if (Object.getOwnPropertySymbols(x).length) {
    throw new TypeError('Symbol key');
  }
  return {schema:SCHEMA, type:x.constructor.name, fields:fields(x, new Set([x]))};
}

/** @param {unknown[]} x */
function decode(x) {
  if (!Array.isArray(x)) throw new TypeError('Malformed typed node');
  switch (x[0]) {
    case 'u': return undefined;
    case 'z': return null;
    case 'minus-zero': return -0;
    case 's':
    case 'b':
    case 'n': return x[1];
    case 'a': return x[1].map(decode);
    case 'o': {
      const obj = Object.create(x[1] ? null : Object.prototype);
      restoreFields(obj, x[2]);
      return obj;
    }
    default: throw new TypeError('Unknown typed node');
  }
}

/** @param {object} target @param {unknown[]} list */
function restoreFields(target, list) {
  for (const [k, enumerable, configurable, writable, encoded] of list) {
    if (Object.hasOwn(target, k)) throw new TypeError('Duplicate own field');
    Object.defineProperty(target, k, {
      enumerable, configurable, writable, value:decode(encoded)
    });
  }
}

/**
 * Prototype reconstruction is restricted to explicitly reviewed classes.
 * This is not yet proof that the replayed Store transitions are equivalent.
 * @param {object} capture @param {Record<string,function>} classes
 */
function restoreAction(capture, classes) {
  if (capture?.schema !== SCHEMA || !Object.hasOwn(classes, capture.type)) {
    throw new TypeError('Unknown action class');
  }
  const action = Object.create(classes[capture.type].prototype);
  restoreFields(action, capture.fields);
  return action;
}

module.exports = {SCHEMA, captureAction, restoreAction};
