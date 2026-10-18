'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {installStateScopedCopySessionLoader} = require('./copied-session-state-scope-hook.cjs');
const restoreLoader = installStateScopedCopySessionLoader();
try {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} moduleName */
  const load = moduleName => require(path.join(root, moduleName));
  const {preparedRegidrago} = require('./apex-attack-action.cjs');
  const {initializeCards} = require('./headless.cjs');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {EndTurnEffect} = load('game/store/effects/game-phase-effects');
  const {openCopyAttackSession, cloneAttacks, clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');

  const board = preparedRegidrago();
  const before = board.store.state;
  const copycat = before.players[0].active.getPokemonCard();
  const source = initializeCards().getCardByName('Hisuian Goodra VSTAR LOR');
  assert.ok(copycat && source);
  before.players[0].discard.cards.push(source);
  const attacks = cloneAttacks(source.attacks);
  openCopyAttackSession(before, before.players[0], copycat, source, attacks, attacks[0]);

  const calls = [];
  const saved = source.reduceEffect;
  source.reduceEffect = function(store, state, effect) {
    if (effect instanceof EndTurnEffect && this === copycat) {
      calls.push(state === before ? 'original' : 'backup');
    }
    return state;
  };
  try {
    board.store.reduceEffect(before,new EndTurnEffect(before.players[0]));
    assert.deepEqual(calls,['original'],
      'Existing copied attack session must run before rejected action');
    // Prepared board has Grass+Grass but no Fire. Existing paid-Apex
    // fixture establishes this root attack is rejected by the real Store.
    assert.throws(() =>
      board.store.dispatch(new AttackAction(before.players[0].id,'Apex Dragon')));
    const after = board.store.state;
    assert.notStrictEqual(after,before,'Rejected root action must replace State');
    assert.strictEqual(after.players[0].active.getPokemonCard(),copycat,
      'Rollback preserves the same pinned Card instance');
    board.store.reduceEffect(after,new EndTurnEffect(after.players[0]));
    const result = {
      engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      rollbackChangedStateIdentity:after !== before,
      physicalCopycatIdentityPreserved:true,
      callbacks:calls,
      scope:'Invalid underpaid AttackAction on injected board; no source-dealt game'
    };
    console.log('COPIED_SESSION_ROLLBACK',JSON.stringify(result,null,2));
    assert.deepEqual(calls,['original'],
      'State-scoped copy session is expected to be lost when Store replaces State');
  } finally {
    source.reduceEffect = saved;
    clearCopyAttackSessionsForTests();
  }
} finally {
  restoreLoader();
}
