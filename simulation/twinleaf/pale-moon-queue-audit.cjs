'use strict';
const assert = require('node:assert/strict');

/**
 * Observe only the specific Pale Moon-GX delayed-KO effect whose target
 * changes from Active to Bench during one real root Store dispatch.
 * Captured references stay in process; output contains detached primitives.
 * @param {object} state Twinleaf State.
 * @returns {object[]}
 */
function capture(state) {
  return state.players.map(player => ({
    active: player.active,
    bench: [...player.bench],
    pending: [...player.pendingEndOfTurnEffects]
  }));
}

/**
 * @param {object[]} before Root pre-dispatch player snapshots.
 * @param {object[]} after Root post-dispatch player snapshots.
 * @returns {object[]} Source Active-to-Bench cases with a queued Pale Moon-GX KO.
 */
function inspectPaleMoonExits(before, after) {
  const exits = [];
  for (let seat = 0; seat < before.length; seat += 1) {
    const old = before[seat];
    const next = after[seat];
    if (!next || !old.active || !next.bench.includes(old.active)) continue;
    for (const effect of old.pending) {
      if (effect.type !== 'knock_out' || effect.attack?.name !== 'Pale Moon-GX'
          || effect.target !== old.active) continue;
      const persisted = next.pending.some(item =>
        item.type === 'knock_out' && item.attack?.name === 'Pale Moon-GX'
        && item.target === old.active);
      exits.push({
        seat, target: old.active.getPokemonCard()?.fullName ?? null,
        source: effect.sourceCard?.fullName ?? null,
        queuePersistsOnBench: persisted
      });
    }
  }
  return exits;
}

/**
 * Scoped wrapper for an independently replayed source game.
 * Speculative Store instances are excluded by source AddPlayerAction identity.
 * The report distinguishes one exercised failure from a never-exercised rule.
 * @template T
 * @param {Function} Store Pinned compiled Store constructor.
 * @param {()=>T} work Replay callback.
 * @returns {{result:T,rootDispatches:number,queueObservedDispatches:number,firstQueue:object|null,exits:object[],status:string}}
 */
function withPaleMoonQueueAudit(Store, work) {
  const descriptor = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof descriptor?.value, 'function');
  let root = null;
  let step = 0;
  let queueObservedDispatches = 0;
  let firstQueue = null;
  let observedUnexplainedBenchQueue = false;
  const exits = [];
  const patched = function(...args) {
    const action = args[0]?.constructor?.name ?? null;
    if (root === null && action === 'AddPlayerAction') root = this;
    if (this !== root) return descriptor.value.apply(this, args);
    const before = capture(this.state);
    const turn = this.state.turn ?? null;
    const result = descriptor.value.apply(this, args);
    const after = capture(this.state);
    const pending = after.flatMap((p, seat) =>
      p.pending.filter(effect => effect.type === 'knock_out'
        && effect.attack?.name === 'Pale Moon-GX').map(effect => ({
          seat, target: effect.target?.getPokemonCard()?.fullName ?? null,
          targetPosition: effect.target === p.active ? 'active'
            : p.bench.includes(effect.target) ? 'bench' : 'elsewhere',
          source: effect.sourceCard?.fullName ?? null
        })));
    if (pending.length) {
      queueObservedDispatches += 1;
      if (firstQueue === null) firstQueue = {step, turn, action, pending};
    }
    for (const exit of inspectPaleMoonExits(before, after)) {
      exits.push({step, turn, action, ...exit});
    }
    if (pending.some(item => item.targetPosition === 'bench') &&
        !exits.some(item => item.step === step && item.queuePersistsOnBench)) {
      observedUnexplainedBenchQueue = true;
    }
    step += 1;
    return result;
  };
  Object.defineProperty(Store.prototype, 'dispatch', {...descriptor, value: patched});
  let result;
  try {
    result = work();
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch', descriptor);
  }
  return {
    result, rootDispatches: step, queueObservedDispatches, firstQueue, exits,
    observedUnexplainedBenchQueue,
    status: exits.some(exit => exit.queuePersistsOnBench) ? 'exercised-failing'
      : observedUnexplainedBenchQueue ? 'unresolved'
      : exits.length ? 'exercised-cleared' : 'not-exercised'
  };
}

module.exports = {capture, inspectPaleMoonExits, withPaleMoonQueueAudit};
