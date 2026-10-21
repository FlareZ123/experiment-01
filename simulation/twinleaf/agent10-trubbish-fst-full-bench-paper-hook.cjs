'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent10-trubbish-fst-full-bench-paper-v1';
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Correct one pinned Twinleaf prefab mismatch without changing vendor code.
 * The printed FST 168 Call for Family attack ends before searching if no Bench
 * space exists (Advanced Rulebook C-11). The native prefab instead throws.
 * The AttackEffect and its normal turn-ending reducer stay in the native engine.
 *
 * All intercepted reducer calls are diagnostic, including hypothetical calls;
 * the caller must independently verify real Store dispatch and turn continuity.
 *
 * @template T
 * @param {()=>T} execute Synchronous native experiment.
 * @param {{Trubbish?:Function,AttackEffect?:Function}} [deps] Test injection.
 * @returns {{result:T,audit:{version:string,skippedFullBenchSearches:number,
 *   delegatedReducerCalls:number,competitiveQualified:false}}}
 */
function withTrubbishFullBenchPaperHook(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const Trubbish = deps.Trubbish ??
    require(path.join(OUTPUT, 'sets/09-sword-and-shield/set-fusion-strike/trubbish')).Trubbish;
  const AttackEffect = deps.AttackEffect ??
    require(path.join(OUTPUT, 'game/store/effects/game-effects')).AttackEffect;
  const original = Object.getOwnPropertyDescriptor(Trubbish.prototype, 'reduceEffect');
  assert.equal(typeof original?.value, 'function');

  const audit = {
    version: VERSION,
    skippedFullBenchSearches: 0,
    delegatedReducerCalls: 0,
    competitiveQualified: false
  };
  function paperFullBenchReduce(store, state, effect) {
    const slots = effect?.player?.bench;
    const full = Array.isArray(slots) && slots.length > 0 &&
      slots.every(slot => Array.isArray(slot?.cards) && slot.cards.length > 0);
    if (effect instanceof AttackEffect &&
        effect.attack === this.attacks[0] && full) {
      audit.skippedFullBenchSearches++;
      return state;
    }
    audit.delegatedReducerCalls++;
    return original.value.call(this, store, state, effect);
  }

  Object.defineProperty(Trubbish.prototype, 'reduceEffect', {
    ...original, value: paperFullBenchReduce
  });
  try {
    return {result: execute(), audit};
  } finally {
    assert.strictEqual(Trubbish.prototype.reduceEffect, paperFullBenchReduce);
    Object.defineProperty(Trubbish.prototype, 'reduceEffect', original);
  }
}

module.exports = {VERSION, withTrubbishFullBenchPaperHook};
