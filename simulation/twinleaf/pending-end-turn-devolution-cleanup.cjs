'use strict';
const assert = require('node:assert/strict');

/**
 * Opt-in, reversible paper-rules correction for native DEVOLVE_POKEMON.
 * The engine's original helper clears local attack effects but keeps
 * queued opponent-next-turn effects on the same PokemonCardList.
 *
 * Only a completed devolution that replaces the top Pokemon is eligible.
 * This preserves pending effects on unaffected slots and does not
 * modify the pinned vendor submodule.
 *
 * @param {{prefabs:object,StateUtils:object}} types Pinned compiled modules.
 */
function installPendingEndTurnDevolutionCleanup(types) {
  const { prefabs, StateUtils } = types;
  const original = Object.getOwnPropertyDescriptor(prefabs, 'DEVOLVE_POKEMON');
  assert.equal(typeof original?.value, 'function');
  assert.equal(typeof StateUtils?.findOwner, 'function');
  let removed = 0;
  const events = [];

  function wrapped(store, state, target, destination) {
    const before = target.getPokemonCard();
    const oldDepth = target.getPokemons().length;
    const result = original.value.call(this, store, state, target, destination);
    const after = target.getPokemonCard();
    const newDepth = target.getPokemons().length;
    if (newDepth >= oldDepth || before === after) return result;

    const owner = StateUtils.findOwner(state, target);
    const queue = owner.pendingEndOfTurnEffects;
    const dropped = queue.filter(effect => effect.target === target);
    if (dropped.length > 0) {
      owner.pendingEndOfTurnEffects = queue.filter(effect =>
        effect.target !== target);
      removed += dropped.length;
      events.push({
        ownerId: owner.id,
        before: before?.fullName ?? null,
        after: after?.fullName ?? null,
        count: dropped.length,
        attacks: dropped.map(effect => effect.attack?.name ?? null)
      });
    }
    return result;
  }

  Object.defineProperty(prefabs, 'DEVOLVE_POKEMON',
    { ...original, value: wrapped });
  return {
    evidence: () => ({ removed, events: [...events] }),
    restore: () => {
      assert.strictEqual(prefabs.DEVOLVE_POKEMON, wrapped,
        'Another hook displaced native devolution cleanup ownership');
      Object.defineProperty(prefabs, 'DEVOLVE_POKEMON', original);
    }
  };
}

/**
 * Run a scoped paper-rule correction and guarantee prototype restoration.
 * @template T
 * @param {{prefabs:object,StateUtils:object}} types
 * @param {()=>T} work
 * @returns {{result:T,removed:number,events:object[]}}
 */
function withPendingEndTurnDevolutionCleanup(types, work) {
  const installed = installPendingEndTurnDevolutionCleanup(types);
  try {
    const result = work();
    return { result, ...installed.evidence() };
  } finally {
    installed.restore();
  }
}
module.exports = {
  installPendingEndTurnDevolutionCleanup,
  withPendingEndTurnDevolutionCleanup
};
