'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent38-paper-fullbench-trubbish-fst-v1';
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/**
 * Repair the pinned Trubbish FST 168 attack's full-Bench behavior without
 * touching the vendor tree. Paper rulebook C-11: a Bench-search attack with
 * no free slots ends without attempting a search; it is still an attack.
 * This only suppresses the card reducer's search call. The Store's attack
 * resolution and end-of-turn handling remain native.
 *
 * @param {{exemplar?:object,WAS_ATTACK_USED?:Function,
 *   GET_PLAYER_BENCH_SLOTS?:Function}} [deps] Pinned seams for tests.
 * @returns {{restore:()=>void,audit:()=>{version:string,skippedSearches:number}}}
 */
function installPaperFullBenchTrubbishHook(deps = {}) {
  if (installed) throw new Error('Trubbish FST hook already installed');
  const exemplar = deps.exemplar ??
    require('./headless.cjs').initializeCards().getCardByName('Trubbish FST');
  assert.equal(exemplar?.fullName, 'Trubbish FST',
    'Pinned Trubbish FST printing unavailable');
  const prototype = Object.getPrototypeOf(exemplar);
  assert.equal(prototype?.constructor?.name, 'Trubbish',
    'Pinned Trubbish FST reducer changed');
  assert.equal(exemplar.attacks?.[0]?.name, 'Call for Family',
    'Pinned Trubbish FST first attack changed');
  assert.equal(exemplar.attacks?.[0]?.damage, 0,
    'Pinned Trubbish FST first attack damage changed');
  const native = deps.WAS_ATTACK_USED && deps.GET_PLAYER_BENCH_SLOTS ? null :
    require(path.join(output, 'game/store/prefabs/prefabs'));
  const wasAttackUsed = deps.WAS_ATTACK_USED ?? native.WAS_ATTACK_USED;
  const benchSlots = deps.GET_PLAYER_BENCH_SLOTS ?? native.GET_PLAYER_BENCH_SLOTS;
  assert.equal(typeof wasAttackUsed, 'function');
  assert.equal(typeof benchSlots, 'function');
  const previous = prototype.reduceEffect;
  assert.equal(typeof previous, 'function');
  let skippedSearches = 0;
  prototype.reduceEffect = function paperFullBenchTrubbishReduceEffect(store, state, effect) {
    if (wasAttackUsed(effect, 0, this) &&
        effect.player && benchSlots(effect.player).length === 0) {
      skippedSearches++;
      return state;
    }
    return previous.call(this, store, state, effect);
  };
  const restore = () => {
    if (!installed) return;
    prototype.reduceEffect = previous;
    installed = null;
  };
  const audit = () => Object.freeze({version:VERSION, skippedSearches});
  installed = {restore, audit};
  return installed;
}

/**
 * @template T
 * @param {()=>T} execute The original synchronous native Store run.
 * @param {object} [deps] Optional pinned test seams.
 * @returns {{result:T,audit:{version:string,skippedSearches:number}}}
 */
function withPaperFullBenchTrubbishHook(execute, deps) {
  assert.equal(typeof execute, 'function');
  const hook = installPaperFullBenchTrubbishHook(deps);
  try {
    const result = execute();
    return {result, audit:hook.audit()};
  } finally {
    hook.restore();
  }
}

module.exports = {VERSION,installPaperFullBenchTrubbishHook,
  withPaperFullBenchTrubbishHook};
