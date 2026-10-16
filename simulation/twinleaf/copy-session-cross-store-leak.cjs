'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {preparedRegidrago} = require('./apex-attack-action.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName @returns {any} */
const load = moduleName => require(path.join(output, moduleName));

/**
 * Reproduce module-global copied-attack session corruption when another
 * independent Store resolves a normal effect between two effect callbacks
 * of the first Store. This is a session-lifetime characterization, not a
 * simulated deck game or an alleged tournament exploit.
 *
 * @param {boolean} interleaveIndependentStore
 * @returns {{sourceCallbacks:number,interleaved:boolean,sourceAfterFirst:number,sourceAfterSecond:number}}
 */
function runSessionInterleaving(interleaveIndependentStore) {
  const {EndTurnEffect} = load('game/store/effects/game-phase-effects');
  const {cloneAttacks, openCopyAttackSession,
    clearCopyAttackSessionsForTests} =
      load('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const a = preparedRegidrago();
  const originalRegidrago = a.attacking.active.getPokemonCard();
  const source = initializeCards().getCardByName('Hisuian Goodra VSTAR LOR');
  assert.ok(originalRegidrago && source);
  a.attacking.discard.cards.push(source);

  const clones = cloneAttacks(source.attacks);
  let callbacks = 0;
  const original = source.reduceEffect;
  source.reduceEffect = function(_store, state, effect) {
    if (effect instanceof EndTurnEffect) callbacks += 1;
    return state;
  };
  try {
    openCopyAttackSession(a.state, a.attacking,
      originalRegidrago, source, clones, clones[0]);

    a.store.reduceEffect(a.state, new EndTurnEffect(a.attacking));
    const sourceAfterFirst = callbacks;
    assert.equal(sourceAfterFirst, 1,
      'Control: same-Store copied source sees its first EndTurnEffect');

    if (interleaveIndependentStore) {
      const b = preparedRegidrago();
      assert.notStrictEqual(b.attacking.active.getPokemonCard(),
        originalRegidrago);
      b.store.reduceEffect(b.state, new EndTurnEffect(b.attacking));
    }

    a.store.reduceEffect(a.state, new EndTurnEffect(a.attacking));
    return {
      sourceCallbacks: callbacks,
      interleaved: interleaveIndependentStore,
      sourceAfterFirst,
      sourceAfterSecond: callbacks
    };
  } finally {
    source.reduceEffect = original;
    clearCopyAttackSessionsForTests();
  }
}

function checkGlobalSessionIsolation() {
  const uninterrupted = runSessionInterleaving(false);
  const interleaved = runSessionInterleaving(true);
  assert.equal(uninterrupted.sourceCallbacks, 2,
    '4-EndTurn sticky budget must preserve same Store session');
  assert.equal(interleaved.sourceCallbacks, 1,
    'An unrelated Store must not prune the original Store session, but pinned engine currently does');
  return {
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    uninterrupted, interleaved,
    finding: 'Pinned copyAttackSessions is module-global and pruned using whichever Store state next resolves any effect',
    scope: 'Two independent injected Stores and real Store.reduceEffect callbacks, source reducer instrumented; no games or match strength'
  };
}

if (require.main === module) {
  console.log('GLOBAL_COPY_SESSION',JSON.stringify(checkGlobalSessionIsolation(),null,2));
}

module.exports = {checkGlobalSessionIsolation};
