'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION =
  'agent12-capture-energy-empty-deck-reversible-paper-exception-v1';
const ROOT = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Narrow, opt-in native source-card correction. A regular Energy attachment
 * remains playable when the deck is already empty mid-turn, while the
 * Capture Energy printed Basic search simply has no card to find.
 *
 * Pin context: native play-card-reducer stamps energyPlayedTurn before
 * Store.reduceEffect, and Capture Energy's pre-attachment search calls
 * BLOCK_IF_DECK_EMPTY. Without the hook, this throws after stamping the
 * allowance and before any physical Energy moves from hand to Active.
 *
 * This hook does not alter Twinleaf's pinned submodule or attempt to correct
 * unrelated alternate-zone attachments, search choices or shuffled deals.
 *
 * @template T
 * @param {()=>T} execute Synchronous real native Store fixture or experiment.
 * @param {{CaptureEnergy?:Function,AttachEnergyEffect?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPaperCaptureEnergyEmptyDeck(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const {CaptureEnergy} = deps.CaptureEnergy ? {
    CaptureEnergy: deps.CaptureEnergy
  } : require(path.join(ROOT,
    'sets/09-sword-and-shield/set-rebel-clash/capture-energy'));
  const {AttachEnergyEffect} = deps.AttachEnergyEffect ? {
    AttachEnergyEffect: deps.AttachEnergyEffect
  } : require(path.join(ROOT,
    'game/store/effects/play-card-effects'));
  const original =
    Object.getOwnPropertyDescriptor(CaptureEnergy.prototype, 'reduceEffect');
  assert.equal(typeof original?.value, 'function');
  const audit = {version: VERSION, nativeClass: 'Capture Energy RCL',
    beforeAttachmentOwnDeckEmpty: 0, skippedOnlyEmptySearch: 0,
    unaffectedEffectCalls: 0, paperGameQualified: false};
  function reduceEffect(store, state, effect) {
    if (effect instanceof AttachEnergyEffect && effect.energyCard === this &&
        effect.player?.hand?.cards?.includes(this) === true &&
        effect.player?.deck?.cards?.length === 0) {
      audit.beforeAttachmentOwnDeckEmpty++;
      audit.skippedOnlyEmptySearch++;
      return state;
    }
    audit.unaffectedEffectCalls++;
    return original.value.call(this, store, state, effect);
  }
  Object.defineProperty(CaptureEnergy.prototype, 'reduceEffect',
    {...original, value: reduceEffect});
  try {
    return {result: execute(), audit};
  } finally {
    assert.equal(CaptureEnergy.prototype.reduceEffect, reduceEffect);
    Object.defineProperty(CaptureEnergy.prototype, 'reduceEffect', original);
  }
}

module.exports = {VERSION, withPaperCaptureEnergyEmptyDeck};
