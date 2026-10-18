'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');
const restoreLoader = installStateScopedCopySessionLoader();
let restoreTransfer = () => {};
try {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name */
  const load = name => require(path.join(root, name));
  const {preparedRegidrago} = require('./apex-attack-action.cjs');
  const {initializeCards} = require('./headless.cjs');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {AttackEffect} = load('game/store/effects/game-effects');
  const {AfterDamageEffect} = load('game/store/effects/attack-effects');
  const {clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');
  const {installCopySessionAwareSimulatorHook} =
    require('./copy-session-aware-simulator-hook.cjs');
  const simulatorModule = load('game/bots/simulator');

  const board = preparedRegidrago();
  board.attachFire();
  const source = initializeCards().getCardByName('Hisuian Goodra VSTAR LOR');
  assert.ok(source);
  board.attacking.discard.cards.push(source);

  board.store.dispatch(new AttackAction(board.attacking.id, 'Apex Dragon'));
  const choose = board.store.state.prompts.find(p =>
    p.constructor.name === 'ChooseAttackPrompt' && p.result === undefined);
  assert.ok(choose && choose.cards.includes(source));
  board.store.dispatch(new ResolvePromptAction(choose.id, source.attacks[0]));
  assert.equal(board.defending.active.damage, 200);
  assert.equal(board.attacking.active.damageReductionNextTurn, 80);

  let resolved = 0;
  while (true) {
    const pending = board.store.state.prompts.find(p =>
      p.constructor.name === 'WaitPrompt' && p.result === undefined);
    if (!pending) break;
    board.store.dispatch(new ResolvePromptAction(pending.id, null));
    resolved += 1;
    assert.ok(resolved < 12);
  }

  const parent = board.store.state;
  assert.equal(parent.prompts.some(p => p.result === undefined),false,
    'Copied attack must resolve all pending prompts before Simulator constructor');
  const selected = parent.playerLastAttack[board.attacking.id].attack;
  assert.equal(selected.name, 'Rolling Iron');

  const baseline = new simulatorModule.Simulator(parent);
  restoreTransfer = installCopySessionAwareSimulatorHook();
  const copied = new simulatorModule.Simulator(parent);
  const copycat = board.attacking.active.getPokemonCard();
  const events = [];
  const originalReducer = source.reduceEffect;
  source.reduceEffect = function(store, state, effect) {
    if (effect instanceof AfterDamageEffect && this === copycat) {
      events.push(store === board.store ? 'parent' :
        store === baseline.store ? 'no-transfer' :
        store === copied.store ? 'with-transfer' : 'unknown');
    }
    return state;
  };
  /** @param {any} state @param {any} attack */
  function afterDamage(state, attack) {
    const player = state.players.find(p => p.id === board.attacking.id);
    const opponent = state.players.find(p => p.id === board.defending.id);
    assert.ok(player && opponent);
    return new AfterDamageEffect(new AttackEffect(player, opponent, attack), 0);
  }
  try {
    board.store.reduceEffect(parent,afterDamage(parent,selected));
    baseline.store.reduceEffect(baseline.store.state,
      afterDamage(baseline.store.state,
        baseline.store.state.playerLastAttack[board.attacking.id].attack));
    copied.store.reduceEffect(copied.store.state,
      afterDamage(copied.store.state,
        copied.store.state.playerLastAttack[board.attacking.id].attack));
    board.store.reduceEffect(parent,afterDamage(parent,selected));
  } finally {
    source.reduceEffect = originalReducer;
    clearCopyAttackSessionsForTests();
  }
  assert.deepEqual(events,['parent','with-transfer','parent'],
    'A paid copied attack must survive explicit session transfer into an actual Simulator');
  console.log('PAID_COPY_CLONE_IDENTITY',JSON.stringify({
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    paidAttack:'Apex Dragon to Rolling Iron',
    damage:board.defending.active.damage,
    reduction:board.attacking.active.damageReductionNextTurn,
    waitPromptsResolved:resolved,
    selectedHistory:selected.name,
    events,
    scope:'Actual paid AttackAction and ChooseAttackPrompt, followed by directed copied AfterDamage; injected board'
  },null,2));
} finally {
  restoreTransfer();
  restoreLoader();
}
