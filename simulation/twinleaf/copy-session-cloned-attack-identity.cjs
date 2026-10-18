'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');

const restoreLoader = installStateScopedCopySessionLoader();
let restoreSimulator = () => {};
try {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} moduleName */
  const load = moduleName => require(path.join(root, moduleName));
  const {initializeCards} = require('./headless.cjs');
  const {preparedRegidrago} = require('./apex-attack-action.cjs');
  const {installCopySessionAwareSimulatorHook} =
    require('./copy-session-aware-simulator-hook.cjs');
  const {
    cloneAttacks, openCopyAttackSession, shouldDelegateCopyAttackSession,
    clearCopyAttackSessionsForTests
  } = load('game/store/prefabs/copy-attack-delegation');
  const {AttackEffect} = load('game/store/effects/game-effects');
  const {AfterDamageEffect} = load('game/store/effects/attack-effects');
  const simulatorModule = load('game/bots/simulator');

  const board = preparedRegidrago();
  const copycat = board.attacking.active.getPokemonCard();
  const source = initializeCards().getCardByName('Hisuian Goodra VSTAR LOR');
  assert.ok(source && copycat);
  board.attacking.discard.cards.push(source);
  const attacks = cloneAttacks(source.attacks);
  openCopyAttackSession(board.state, board.attacking, copycat,
    source, attacks, attacks[0]);

  const originalAttack = board.state.playerLastAttack[board.attacking.id].attack;
  assert.strictEqual(originalAttack, attacks[0]);

  restoreSimulator = installCopySessionAwareSimulatorHook();
  const simulator = new simulatorModule.Simulator(board.state);
  const cloneState = simulator.store.state;
  const clonePlayer = cloneState.players.find(p => p.id === board.attacking.id);
  const cloneOpponent = cloneState.players.find(p => p.id === board.defending.id);
  const cloneAttack = cloneState.playerLastAttack[board.attacking.id].attack;
  assert.ok(clonePlayer && cloneOpponent && cloneAttack);

  const event = (player, opponent, attack) =>
    new AfterDamageEffect(new AttackEffect(player, opponent, attack), 0);
  const parentEvent = event(board.attacking, board.defending, originalAttack);
  const cloneEvent = event(clonePlayer, cloneOpponent, cloneAttack);
  const session = {
    copycatCard: copycat,
    sourceCard: source,
    clonedAttacks: attacks,
    playerId: board.attacking.id,
    endTurnsRemaining: 4
  };

  const parentMatch = shouldDelegateCopyAttackSession(
    session, board.state, parentEvent);
  const cloneMatch = shouldDelegateCopyAttackSession(
    session, cloneState, cloneEvent);
  assert.equal(parentMatch, true, 'Original copied attack must be recognized');

  const events = [];
  const saved = source.reduceEffect;
  source.reduceEffect = function(store, state, effect) {
    if (effect instanceof AfterDamageEffect && this === copycat) {
      events.push(store === board.store ? 'real' : 'speculative');
    }
    return state;
  };
  try {
    board.store.reduceEffect(board.state, parentEvent);
    simulator.store.reduceEffect(cloneState, cloneEvent);
  } finally {
    source.reduceEffect = saved;
    clearCopyAttackSessionsForTests();
  }
  const result = {
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    parentAttackMatchesSession: originalAttack === attacks[0],
    clonedAttackSharesParentIdentity: cloneAttack === originalAttack,
    parentMatch, cloneMatch, events,
    scope: 'Injected established board, actual cloned State and delegated AfterDamageEffect; not complete game or policy evaluation'
  };
  console.log('COPIED_CLONE_ATTACK_IDENTITY', JSON.stringify(result, null, 2));
  assert.deepEqual(events, ['real'],
    'Current session transfer is expected to omit cloned selected-attack identity');
  assert.equal(cloneMatch, false,
    'Expected cloned Attack value does not match parent session Attack object');
} finally {
  restoreSimulator();
  restoreLoader();
}
