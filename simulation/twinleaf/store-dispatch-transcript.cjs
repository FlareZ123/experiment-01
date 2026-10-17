'use strict';

const { actionTraceSha256 } = require('../evaluation/canonical-action-trace.cjs');
const {sourceInputTraceSha256} = require('../evaluation/source-input-canonical.cjs');
const { captureChooseCardsReferences } = require('./choose-cards-reference.cjs');
const { captureChooseAttackReference } = require('./choose-attack-reference.cjs');
const { captureSlotChoice } = require('./choice-slot-reference.cjs');
const { captureChooseEnergyReference } = require('./choose-energy-reference.cjs');
const { captureAttachEnergyReference } = require('./attach-energy-reference.cjs');
const { captureAction } = require('./source-action-value-codec.cjs');
const { capturePromptAction } = require('./source-prompt-action-codec.cjs');
const {sourceZoneSnapshot,zoneSnapshotDigest} = require('./source-zone-checkpoint.cjs');
const {observableState,hash:continuityHash} = require('./source-state-continuity.cjs');
const {sourceEffectDigest}=require('./source-effect-checkpoint.cjs');
const {storeDataGraphFingerprint}=require('./store-data-graph-fingerprint.cjs');

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


function diagnosticSnapshot(value, ancestors = new Set(), depth = 0, allowRootClass = false) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (value === undefined) return {kind:'undefined'};
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) ? value : {kind:'number', display:String(value)};
  }
  if (typeof value !== 'object') return {kind:typeof value};
  if (ancestors.has(value)) return {kind:'cycle'};
  if (depth > 4) return {kind:'depth-limit'};
  const proto = Object.getPrototypeOf(value);
  if (!allowRootClass && !Array.isArray(value) && proto !== Object.prototype && proto !== null) {
    const ownFullName = Object.getOwnPropertyDescriptor(value, 'fullName');
    return {kind:'class', name:proto?.constructor?.name || 'unknown',
      ...(typeof ownFullName?.value === 'string' ? {fullName:ownFullName.value} : {})};
  }
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return Array.from({length:value.length}, (_, i) =>
        Object.hasOwn(value, i) ? diagnosticSnapshot(value[i], ancestors, depth + 1)
          : {kind:'array-hole'});
    }
    const out = Object.create(null);
    for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
      if (!desc.enumerable) continue;
      Object.defineProperty(out, key, {enumerable:true, configurable:true, writable:true,
        value:Object.hasOwn(desc, 'value') ?
          diagnosticSnapshot(desc.value, ancestors, depth + 1) : {kind:'accessor'}});
    }
    return out;
  } finally {
    ancestors.delete(value);
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
    if (options.sourceZoneEveryDispatch === true) {
      event.zoneDigestBefore = zoneSnapshotDigest(sourceZoneSnapshot(this.state));
      event.continuityDigestBefore = continuityHash(observableState(this.state));
      event.effectDigestBefore = sourceEffectDigest(this.state);
    }
    if(options.storeDataGraphEveryDispatch === true) {
      event.storeDataGraphBefore=storeDataGraphFingerprint(this,
        {includeGraph:options.storeDataGraphDebugSteps?.includes(step)===true});
    }
    const pending = this.state?.prompts?.find(p => p.result === undefined);
    if (pending && action?.constructor?.name === 'ResolvePromptAction') {
      event.pendingPrompt = {
        id:pending.id ?? null,
        kind:pending.constructor.name,
        message:pending.message ?? null,
        playerId:pending.playerId ?? null,
        perspectivePlayerId:pending.perspectivePlayerId ?? pending.playerId ?? null
      };
    }
    if (pending?.constructor?.name === 'ChooseCardsPrompt' &&
        action?.constructor?.name === 'ResolvePromptAction') {
      try {
        event.choiceReferences = captureChooseCardsReferences(pending, action);
      } catch (error) {
        event.choiceCaptureError = error.message;
        captureErrors.push('step ' + step + ': choice refs: ' + error.message);
      }
    }
    if (pending?.constructor?.name === 'ChooseAttackPrompt' &&
        action?.constructor?.name === 'ResolvePromptAction') {
      try {
        event.attackChoice = captureChooseAttackReference(pending, action);
      } catch (error) {
        event.attackChoiceCaptureError = error.message;
        captureErrors.push('step ' + step + ': chosen attack: ' + error.message);
      }
    }
    if (['ChoosePokemonPrompt','ChoosePrizePrompt'].includes(
      pending?.constructor?.name) &&
        action?.constructor?.name === 'ResolvePromptAction') {
      try {
        event.slotChoice = captureSlotChoice(pending, action, this.state);
      } catch (error) {
        event.slotChoiceCaptureError = error.message;
        captureErrors.push('step ' + step + ': source slot: ' + error.message);
      }
    }
    if (pending?.constructor?.name === 'ChooseEnergyPrompt' &&
        action?.constructor?.name === 'ResolvePromptAction') {
      try {
        event.energyChoice = captureChooseEnergyReference(pending, action);
      } catch (error) {
        event.energyChoiceCaptureError = error.message;
        captureErrors.push('step ' + step + ': EnergyMap choice: ' + error.message);
      }
    }
    if (pending?.constructor?.name === 'AttachEnergyPrompt' &&
        action?.constructor?.name === 'ResolvePromptAction') {
      try {
        event.energyAttachment = captureAttachEnergyReference(pending, action);
      } catch (error) {
        event.energyAttachmentCaptureError = error.message;
        captureErrors.push('step ' + step + ': attached Energy: ' + error.message);
      }
    }
    if (options.promptReferenceActionValues === true &&
        action?.constructor?.name === 'ResolvePromptAction') {
      try {
        event.promptReplayAction = capturePromptAction(pending, action, this.state);
        if (!event.promptReplayAction) {
          event.promptReplayUnsupported = pending?.constructor?.name || 'no-pending-prompt';
        }
      } catch (error) {
        event.promptReplayActionError = error.message;
      }
    }
    if (options.typedActionValues === true) {
      try {
        event.typedAction = captureAction(action);
      } catch (error) {
        event.typedActionError = error.message;
      }
    }
    try {
      event.parameters = portableSnapshot(action, new Set(), true);
    } catch (error) {
      event.captureError = error.message;
      event.partialParameters = diagnosticSnapshot(action, new Set(), 0, true);
      captureErrors.push('step ' + step + ': ' + error.message);
    }
    try {
      return original.value.apply(this, args);
    } catch (error) {
      event.dispatchError = String(error.message || error);
      throw error;
    } finally {
      event.after = observedCounts(this.state);
      if (options.sourceZoneEveryDispatch === true) {
        event.zoneDigestAfter = zoneSnapshotDigest(sourceZoneSnapshot(this.state));
        event.continuityDigestAfter = continuityHash(observableState(this.state));
        event.effectDigestAfter = sourceEffectDigest(this.state);
      }
      if(options.storeDataGraphEveryDispatch === true) {
        event.storeDataGraphAfter=storeDataGraphFingerprint(this,
          {includeGraph:options.storeDataGraphDebugSteps?.includes(step)===true});
      }
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
    capturedChoiceReferenceEvents: trace.filter(event => event.choiceReferences).length,
    capturedAttackChoiceEvents: trace.filter(event => event.attackChoice).length,
    capturedSlotChoiceEvents: trace.filter(event => event.slotChoice).length,
    capturedEnergyChoiceEvents: trace.filter(event => event.energyChoice).length,
    capturedEnergyAttachmentEvents: trace.filter(event => event.energyAttachment).length,
    typedActionValueEvents: trace.filter(event => event.typedAction).length,
    typedActionValueFailures: trace.filter(event => event.typedActionError).length,
    promptReplayActionEvents: trace.filter(event => event.promptReplayAction).length,
    promptReplayActionFailures: trace.filter(event => event.promptReplayActionError).length,
    promptReplayUnsupportedKinds: [...new Set(trace.filter(event =>
      event.promptReplayUnsupported).map(event => event.promptReplayUnsupported))],
    actionInputEnvelopeCoverage: trace.filter(event =>
      event.typedAction || event.promptReplayAction).length,
    failedChoiceReferenceEvents: trace.filter(event => event.choiceCaptureError).length,
    captureScope: options.liveStoreOnly === true ?
      'first-AddPlayerAction-Store-instance' : 'all-Store-instances',
    parametersCaptured: captureErrors.length === 0,
    traceSha256, diagnosticTraceSha256, captureErrors
  };
}

module.exports = { portableSnapshot, diagnosticSnapshot, observedCounts,
  withStoreDispatchTranscript };
