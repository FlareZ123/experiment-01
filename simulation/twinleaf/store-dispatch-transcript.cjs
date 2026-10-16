'use strict';

const { actionTraceSha256 } = require('../evaluation/canonical-action-trace.cjs');

const INSTALLED = Symbol('research-dispatch-transcript');

/**
 * Copy only enumerable data properties into JSON-safe event parameters.
 * Do not invoke accessors or modify game objects.
 * @param {unknown} source
 * @param {Set<object>} ancestors
 * @param {boolean} allowClass Permit one top-level Action class envelope.
 * @param {string} at Data path for actionable capture diagnostics.
 * @returns {unknown}
 */
function portableSnapshot(source, ancestors = new Set(), allowClass = false, at = '$') {
  if (source === null || typeof source === 'string' || typeof source === 'boolean') return source;
  if (typeof source === 'number') {
    if (!Number.isSafeInteger(source)) throw new TypeError('Nonportable number at ' + at);
    return source;
  }
  if (!source || typeof source !== 'object') {
    throw new TypeError('Nonportable ' + typeof source + ' at ' + at);
  }
  if (ancestors.has(source)) throw new TypeError('Cyclic action parameter at ' + at);
  const prototype = Object.getPrototypeOf(source);
  if (!allowClass && !Array.isArray(source) &&
      prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('Nested parameter at ' + at +
      ' has non-JSON prototype ' + (prototype?.constructor?.name || 'unknown'));
  }
  ancestors.add(source);
  try {
    if (Array.isArray(source)) {
      const copy = [];
      for (let i = 0; i < source.length; i += 1) {
        if (!Object.hasOwn(source, i)) throw new TypeError('Sparse parameter array');
        copy.push(portableSnapshot(source[i], ancestors, false, at + '[' + i + ']'));
      }
      if (Object.getOwnPropertyNames(source).length !== source.length + 1) {
        throw new TypeError('Action parameter arrays cannot have extra properties');
      }
      return copy;
    }
    const copy = {};
    const descriptors = Object.getOwnPropertyDescriptors(source);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (!descriptor.enumerable) continue;
      if (!Object.hasOwn(descriptor, 'value')) {
        throw new TypeError('Action parameter accessor cannot be captured');
      }
      Object.defineProperty(copy, key, {
        value: portableSnapshot(descriptor.value, ancestors, false, at + '.' + key),
        enumerable: true, writable: true, configurable: true
      });
    }
    if (Object.getOwnPropertySymbols(source).length) {
      throw new TypeError('Action parameter symbol key');
    }
    return copy;
  } finally {
    ancestors.delete(source);
  }
}

/**
 * Minimal *observed* engine state. This is not a complete replay checkpoint.
 * @param {unknown} state
 * @returns {object}
 */
function observedCounts(state) {
  const players = state?.players || [];
  return {
    turn: state?.turn ?? null,
    phase: state?.phase ?? null,
    activePlayer: state?.activePlayer ?? null,
    winner: state?.winner ?? null,
    deckRemaining: players.map(p => p.deck.cards.length),
    prizesRemaining: players.map(p => p.prizes.filter(z => z.cards.length).length),
    unresolvedPrompts: state?.prompts?.filter(p => p.result === undefined).length ?? 0
  };
}

/**
 * Synchronously instrument actual Store.dispatch calls and restore the class
 * in finally. Serialization failures are reported without suppressing or
 * altering the engine action. The resulting trace is diagnostic only.
 *
 * @template T
 * @param {function} Store Pinned engine's Store constructor.
 * @param {()=>T} work Synchronous match runner.
 * @param {{liveStoreOnly?:boolean}} options Select only the first AddPlayerAction Store.
 * @returns {{result:T, actionTrace:object[], dispatched:number,
 *    parametersCaptured:boolean, traceSha256:string|null, captureErrors:string[]}}
 */
function withStoreDispatchTranscript(Store, work, options = {}) {
  const original = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  if (!original || typeof original.value !== 'function' ||
      original.value[INSTALLED] || typeof work !== 'function') {
    throw new TypeError('Expected uninstrumented Store.dispatch and synchronous callback');
  }
  const trace = [];
  const captureErrors = [];
  let liveStore = null;
  let ignoredOtherStoreDispatches = 0;
  const wrapped = function (...args) {
    const action = args[0];
    if (options.liveStoreOnly === true) {
      if (!liveStore && action?.constructor?.name === 'AddPlayerAction') liveStore = this;
      if (this !== liveStore) {
        ignoredOtherStoreDispatches += 1;
        return original.value.apply(this, args);
      }
    }
    const step = trace.length;
    const event = {
      step, action: action?.constructor?.name || 'UnknownAction',
      parameters: null, before: observedCounts(this.state), after: null
    };
    trace.push(event);
    try {
      event.parameters = portableSnapshot(action, new Set(), true);
    } catch (error) {
      event.captureError = error.message;
      captureErrors.push('step ' + step + ': ' + error.message);
    }
    try {
      return original.value.apply(this, args);
    } catch (error) {
      event.dispatchError = String(error.message || error);
      throw error;
    } finally {
      event.after = observedCounts(this.state);
    }
  };
  Object.defineProperty(wrapped, INSTALLED, { value: true });
  Object.defineProperty(Store.prototype, 'dispatch', { ...original, value: wrapped });
  let result;
  try {
    result = work();
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch', original);
  }
  let traceSha256 = null;
  let diagnosticTraceSha256 = null;
  if (trace.length) {
    try {
      diagnosticTraceSha256 = actionTraceSha256(trace);
      if (!captureErrors.length) traceSha256 = diagnosticTraceSha256;
    } catch (error) {
      captureErrors.push('Canonical diagnostic digest unavailable: ' + error.message);
    }
  }
  return {
    result, actionTrace: trace, dispatched: trace.length,
    ignoredOtherStoreDispatches,
    captureScope: options.liveStoreOnly === true ?
      'first-AddPlayerAction-Store-instance' : 'all-Store-instances',
    parametersCaptured: captureErrors.length === 0,
    traceSha256, diagnosticTraceSha256, captureErrors
  };
}

module.exports = { portableSnapshot, observedCounts, withStoreDispatchTranscript };
