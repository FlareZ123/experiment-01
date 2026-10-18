'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {installStateScopedCopySessionLoader} = require('./copied-session-state-scope-hook.cjs');
const restoreLoader = installStateScopedCopySessionLoader();
let restoreSimulator = () => {};
try {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name */
  const load = name => require(path.join(root, name));
  const {preparedRegidrago} = require('./apex-attack-action.cjs');
  const {initializeCards} = require('./headless.cjs');
  const {openCopyAttackSession, cloneAttacks, clearCopyAttackSessionsForTests,
    inheritCopyAttackSessionsFromState} = load('game/store/prefabs/copy-attack-delegation');
  const {AttackEffect} = load('game/store/effects/game-effects');
  const {AfterDamageEffect} = load('game/store/effects/attack-effects');
  const {installCopySessionAwareSimulatorHook} = require('./copy-session-aware-simulator-hook.cjs');
  const simulatorModule = load('game/bots/simulator');

  const board = preparedRegidrago();
  const copycat = board.attacking.active.getPokemonCard();
  const source = initializeCards().getCardByName('Hisuian Goodra VSTAR LOR');
  assert.ok(source && copycat);
  board.attacking.discard.cards.push(source);
  const attacks = cloneAttacks(source.attacks);
  openCopyAttackSession(board.state, board.attacking, copycat, source, attacks, attacks[0]);
  const parentAttack = board.state.playerLastAttack[board.attacking.id].attack;
  assert.strictEqual(parentAttack, attacks[0]);

  // Invalid hypothetical history cannot be imported.
  const malformed = new simulatorModule.Simulator(board.state).store.state;
  const corruptAttack = malformed.playerLastAttack[board.attacking.id].attack;
  assert.notStrictEqual(corruptAttack, parentAttack);
  corruptAttack.name = 'INVALID COPIED ATTACK';
  assert.throws(() => inheritCopyAttackSessionsFromState(board.state, malformed),
    /Copied session cloned selected attack mismatch/);
  assert.strictEqual(board.state.playerLastAttack[board.attacking.id].attack, parentAttack);

  restoreSimulator = installCopySessionAwareSimulatorHook();
  const first = new simulatorModule.Simulator(board.state);
  const second = new simulatorModule.Simulator(board.state);
  /** @param {any} sim */
  const history = sim => sim.store.state.playerLastAttack[board.attacking.id].attack;
  assert.notStrictEqual(history(first), history(second));
  assert.notStrictEqual(history(first), parentAttack);
  /** @param {any} state @param {any} attack */
  function afterDamage(state, attack) {
    const player = state.players.find(p => p.id === board.attacking.id);
    const opponent = state.players.find(p => p.id === board.defending.id);
    assert.ok(player && opponent);
    return new AfterDamageEffect(new AttackEffect(player, opponent, attack), 0);
  }

  const callbacks = [];
  const savedReducer = source.reduceEffect;
  source.reduceEffect = function(store, state, effect) {
    if (effect instanceof AfterDamageEffect && this === copycat) {
      callbacks.push(store === board.store ? 'parent' :
        store === first.store ? 'branch1' :
        store === second.store ? 'branch2' : 'unknown');
    }
    return state;
  };
  try {
    board.store.reduceEffect(board.state, afterDamage(board.state, parentAttack));
    first.store.reduceEffect(first.store.state, afterDamage(first.store.state, history(first)));
    second.store.reduceEffect(second.store.state, afterDamage(second.store.state, history(second)));
    board.store.reduceEffect(board.state, afterDamage(board.state, parentAttack));
  } finally {
    source.reduceEffect = savedReducer;
    clearCopyAttackSessionsForTests();
  }
  assert.deepEqual(callbacks, ['parent', 'branch1', 'branch2', 'parent']);
  assert.strictEqual(board.state.playerLastAttack[board.attacking.id].attack, parentAttack);
  console.log('COPY_SESSION_CLONE_BRANCH_GUARD',JSON.stringify({
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    invalidHistoryRejected:true,branchSelectedAttacksDistinct:true,callbacks,
    originalAttackPreserved:true,
    scope:'Opt-in copied sessions on injected boards; no natural-game qualification'
  },null,2));
} finally {
  restoreSimulator();
  restoreLoader();
}
