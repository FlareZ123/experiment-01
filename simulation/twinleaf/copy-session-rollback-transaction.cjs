'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');
const {installCopySessionRollbackHook} =
  require('./copy-session-rollback-hook.cjs');

const restoreLoader = installStateScopedCopySessionLoader();
try {
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name @returns {any} */
  const load = name => require(path.join(output, name));
  const {preparedRegidrago} = require('./apex-attack-action.cjs');
  const {initializeCards} = require('./headless.cjs');
  const {PassTurnAction} = load('game/store/actions/game-actions');
  const {EndTurnEffect} = load('game/store/effects/game-phase-effects');
  const prefab = load('game/store/prefabs/copy-attack-delegation');

  /**
   * A controlled late root error after a real EndTurn reducer has decremented
   * the session budget, before Store can accept the action. This fault is
   * injected solely to test atomic rollback of research-owned session data.
   *
   * @param {boolean} snapshotBeforeDispatch
   * @returns {{snapshotBeforeDispatch:boolean,failedPassCallbacks:number,postRollbackCallbacks:number,totalCallbacks:number,rollbackStateReplaced:boolean,errorPreserved:boolean}}
   */
  function trial(snapshotBeforeDispatch) {
    prefab.clearCopyAttackSessionsForTests();
    const restoreRollback = installCopySessionRollbackHook({snapshotBeforeDispatch});
    const board = preparedRegidrago();
    const previous = board.store.state;
    const copycat = board.attacking.active.getPokemonCard();
    const source = initializeCards().getCardByName('Hisuian Goodra VSTAR LOR');
    assert.ok(source && copycat);
    board.attacking.discard.cards.push(source);
    const attacks = prefab.cloneAttacks(source.attacks);
    prefab.openCopyAttackSession(previous, board.attacking, copycat, source,
      attacks, attacks[0]);
    const callbacks = [];
    const oldReducer = source.reduceEffect;
    const oldReduceEffect = board.store.reduceEffect;
    let injected = false;
    source.reduceEffect = function(store,state,effect) {
      if (effect instanceof EndTurnEffect && this === copycat) {
        callbacks.push('delegated');
      }
      return state;
    };
    board.store.reduceEffect = function(state,effect) {
      const result = oldReduceEffect.call(this,state,effect);
      if (effect instanceof EndTurnEffect && !injected) {
        injected = true;
        throw new Error('INJECTED_AFTER_SUCCESSFUL_END_TURN_EFFECT');
      }
      return result;
    };
    try {
      let rejected;
      assert.throws(
        () => board.store.dispatch(new PassTurnAction(board.attacking.id)),
        error => {
          rejected = error;
          return /INJECTED_AFTER_SUCCESSFUL_END_TURN_EFFECT/.test(error.message);
        },
        'The pinned root reducer must roll back the late action failure');
      assert.ok(injected,'Real EndTurnEffect must occur before the injected error');
      const failedPassCallbacks = callbacks.length;
      assert.equal(failedPassCallbacks,1,
        'Injected error must follow exactly one copied EndTurn callback');
      const backup = board.store.state;
      assert.notStrictEqual(backup,previous,'Store must restore a distinct State');
      assert.strictEqual(backup.players[0].active.getPokemonCard(),copycat);
      const restoredSessions = prefab.describeCopySessionsForState(backup);
      assert.equal(restoredSessions.length,1,
        'The copied source session should survive the root State replacement');
      for (let i=0;i<5;i++) {
        board.store.reduceEffect(backup,new EndTurnEffect(backup.players[0]));
      }
      const postRollbackCallbacks = callbacks.length-failedPassCallbacks;
      return {
        snapshotBeforeDispatch,
        failedPassCallbacks,
        postRollbackCallbacks,
        totalCallbacks:callbacks.length,
        rollbackStateReplaced:backup!==previous,
        errorPreserved:rejected?.message ===
          'INJECTED_AFTER_SUCCESSFUL_END_TURN_EFFECT'
      };
    } finally {
      board.store.reduceEffect = oldReduceEffect;
      source.reduceEffect = oldReducer;
      restoreRollback();
      prefab.clearCopyAttackSessionsForTests();
    }
  }

  const postFailureTransfer=trial(false);
  const preDispatchSnapshot=trial(true);
  assert.equal(postFailureTransfer.postRollbackCallbacks,3,
    'Old post-failure transfer should lose one lifetime decrement');
  assert.equal(preDispatchSnapshot.postRollbackCallbacks,4,
    'Transactional snapshot must restore all four future EndTurn callbacks');
  assert.ok(postFailureTransfer.errorPreserved && preDispatchSnapshot.errorPreserved);
  console.log('COPY_SESSION_TRANSACTIONAL_ROLLBACK',JSON.stringify({
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    old:postFailureTransfer,
    repaired:preDispatchSnapshot,
    scope:'Injected late failure in a real PassTurnAction root Store reducer; independent copied-source EndTurn callbacks on an established test board. This does not establish an authentic match exposure.'
  },null,2));
} finally {
  restoreLoader();
}
