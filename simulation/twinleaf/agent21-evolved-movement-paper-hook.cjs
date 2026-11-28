'use strict';

/*
 * Paper rule E-25: a Pokémon's Bench -> Active movement remains an event
 * on that Pokémon after it evolves. Pinned Twinleaf a9905a76 stores moved
 * card IDs, while the current Stage-1 card has a distinct ID.
 *
 * Small, opt-in, reversible compiled-prefab compatibility hook. Neither
 * upstream/vendor source nor the physical hidden zones are modified.
 * When invoked in an experiment, record VERSION and the engine pin.
 */
const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent21-movement-lineage-paper-e25-v1';
const EXPECTED_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Resolve the exact in-play evolution stack of an identified Pokémon.
 * Never match by name: multiple Pokémon with identical names can coexist.
 * @param {object} player Native owner Player, private to Store hook.
 * @param {object} pokemon Native current/top Pokémon instance.
 * @returns {object[]|null} Current stack, null if identity cannot be proved.
 */
function currentStack(player, pokemon) {
  if (!player || !pokemon || !Number.isSafeInteger(pokemon.id)) return null;
  const slots = [player.active,
    ...(Array.isArray(player.bench) ? player.bench : [])];
  for (const slot of slots) {
    if (!slot || typeof slot.getPokemonCard !== 'function' ||
        slot.getPokemonCard() !== pokemon) continue;
    if (typeof slot.getPokemons !== 'function') return null;
    const stack = slot.getPokemons();
    if (!Array.isArray(stack) || !stack.includes(pokemon) ||
        stack.some(card => !Number.isSafeInteger(card?.id))) return null;
    return stack;
  }
  return null;
}

/**
 * Twinleaf's source check only matches the latest card id. The evolutionary
 * Pokémon is the same in-play Pokémon: an earlier stage's move counts.
 *
 * Returns false when its current stack or source movement ledger cannot be
 * authenticated. Called only with the native Store's own player and card.
 */
function movedToActiveInEvolutionLineage(player, pokemon) {
  const ledger = player?.movedToActiveThisTurn;
  if (!Array.isArray(ledger) || !ledger.every(Number.isSafeInteger)) return false;
  const stack = currentStack(player, pokemon);
  return stack !== null && stack.some(card => ledger.includes(card.id));
}

/**
 * Install for one synchronous native Store experiment; restore the exact
 * original export even when work throws. The caller must bind the same pinned
 * engine and expose the hook version in the experiment receipt.
 *
 * @template T
 * @param {()=>T} work
 * @param {{prefabs?: object}} deps Inject compiled prefabs in isolated tests.
 * @returns {T}
 */
function withPaperEvolutionMovement(work, deps = {}) {
  assert.equal(typeof work, 'function');
  const compiled = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const prefabs = deps.prefabs ??
    require(path.join(compiled, 'game/store/prefabs/prefabs'));
  const before = Object.getOwnPropertyDescriptor(
    prefabs, 'MOVED_TO_ACTIVE_THIS_TURN');
  assert.equal(typeof before?.value, 'function',
    'Pinned compiled MOVED_TO_ACTIVE_THIS_TURN export not found');
  assert.ok(before.configurable || before.writable,
    'Pinned prefab export cannot be safely intercepted');

  const previous = before.value;
  const replacement = function paperEvolutionMovement(player, pokemon) {
    // Preserve native-positive decisions, including its direct same-ID case.
    if (previous.call(this, player, pokemon)) return true;
    return movedToActiveInEvolutionLineage(player, pokemon);
  };
  Object.defineProperty(prefabs, 'MOVED_TO_ACTIVE_THIS_TURN', {
    ...before, value: replacement
  });
  try {
    const result = work();
    assert.ok(!result || typeof result.then !== 'function',
      'This temporary Store patch must not cross an async boundary');
    return result;
  } finally {
    Object.defineProperty(prefabs, 'MOVED_TO_ACTIVE_THIS_TURN', before);
  }
}

module.exports = {
  VERSION, EXPECTED_PIN, currentStack, movedToActiveInEvolutionLineage,
  withPaperEvolutionMovement
};
