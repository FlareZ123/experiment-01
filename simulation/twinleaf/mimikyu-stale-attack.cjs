'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const {installPassClearsLastAttackHook} = require('./last-attack-pass-hook.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(root, modulePath));

/**
 * Construct the minimal actual pinned Store with two real Pokemon.
 * The prior attack is injected so the timing question is isolated from
 * hand setup, Energy and drawing. These are mechanical regression fixtures.
 *
 * @returns {object} State, players, cards and Store.
 */
function fixture() {
  const manager = initializeCards();
  const mimikyu = manager.getCardByName('Mimikyu GRI');
  const dratini = manager.getCardByName('Dratini OBF');
  assert.ok(mimikyu && dratini);
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { GamePhase } = load('game/store/state/state');
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const a = new Player();
  a.id = 101;
  a.name = 'copycat-player';
  a.active.cards.push(mimikyu);
  const b = new Player();
  b.id = 202;
  b.name = 'past-attacker';
  b.active.cards.push(dratini);
  state.players = [a, b];
  state.activePlayer = 1;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.playerLastAttack[b.id] = {
    attack: dratini.attacks[0], sourceCard: dratini
  };
  return { store, state, a, b, mimikyu, dratini };
}

/** Isolate a real PassTurnAction reducer before normal turn transitions. */
function testStaleRecordAfterPass() {
  const { playerTurnReducer } =
    load('game/store/reducers/player-turn-reducer');
  const { PassTurnAction } = load('game/store/actions/game-actions');
  const { EndTurnEffect } = load('game/store/effects/game-phase-effects');
  const f = fixture();
  let endTurnObserved = false;
  const reductionStore = {
    /** @param {object} state @param {object} effect */
    reduceEffect(state, effect) {
      endTurnObserved = effect instanceof EndTurnEffect;
      return state;
    }
  };
  playerTurnReducer(reductionStore, f.state, new PassTurnAction(f.b.id));
  assert.equal(endTurnObserved, true, 'Must exercise genuine PassTurn branch');
  assert.equal(f.state.playerLastAttack[f.b.id].attack.name, 'Tail Snap',
    'Passed turn leaves previous attack entry stale');
  return f;
}

/** Show that stale ordinary non-GX attack is copied after intervening pass. */
function testStaleCopycatEffect() {
  const { clearCopyAttackSessionsForTests } =
    load('game/store/prefabs/copy-attack-delegation');
  const { AttackEffect } = load('game/store/effects/game-effects');
  const { GamePhase } = load('game/store/state/state');
  clearCopyAttackSessionsForTests();
  const f = fixture();
  f.state.activePlayer = 0;
  f.state.phase = GamePhase.ATTACK;
  f.state.turn = 4;
  const copycat = new AttackEffect(f.a, f.b, f.mimikyu.attacks[1]);
  copycat.source = f.a.active;
  f.mimikyu.reduceEffect(f.store, f.state, copycat);
  assert.equal(f.b.active.damage, 20,
    'Pinned handler wrongly copies a Tail Snap used on an earlier turn');
  clearCopyAttackSessionsForTests();
  return { damage: f.b.active.damage, staleAttack: 'Tail Snap' };
}

/**
 * Actual Store.dispatch(PassTurnAction) baseline vs opt-in correction.
 * Board/prizes are staged; opponent's earlier attack entry is injected.
 *
 * @param {boolean} corrected Use the reversible pass-history hook.
 * @returns {{corrected:boolean,record:string|null,copyDamage:number}}
 */
function realPassHistoryContract(corrected) {
  const f = fixture();
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {PassTurnAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {AttackEffect} = load('game/store/effects/game-effects');
  const {clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');
  for (const player of f.state.players) {
    player.prizes = Array.from({length: 6},
      () => CardList.fromList(['Dratini OBF']));
    player.deck = CardList.fromList(Array(8).fill('Dratini OBF'));
  }
  clearCopyAttackSessionsForTests();
  const restore = corrected ? installPassClearsLastAttackHook() : () => {};
  try {
    f.store.dispatch(new PassTurnAction(f.b.id));
    // PassTurn opens a real between-turn WaitPrompt. Leaving it pending
    // suspends the generator of the subsequent copied attack before damage.
    let waitsResolved = 0;
    while (true) {
      const wait = f.state.prompts.find(prompt =>
        prompt.constructor.name === 'WaitPrompt' && prompt.result === undefined);
      if (!wait) break;
      f.store.dispatch(new ResolvePromptAction(wait.id, null));
      waitsResolved += 1;
      assert.ok(waitsResolved <= 6, 'Unexpected repeated phase waits');
    }
    const record = f.state.playerLastAttack[f.b.id]?.attack?.name ?? null;
    assert.equal(record, corrected ? null : 'Tail Snap',
      'Pass must exhibit the expected previous-attack history state');

    // Separate printed Copycat resolution probe after the real Pass reducer.
    // This bypasses waiting for the automatic between-turn transition.
    f.state.phase = GamePhase.ATTACK;
    f.state.activePlayer = 0;
    const copycat = new AttackEffect(f.a, f.b, f.mimikyu.attacks[1]);
    copycat.source = f.a.active;
    f.mimikyu.reduceEffect(f.store, f.state, copycat);
    assert.equal(f.b.active.damage, corrected ? 0 : 20);
    return {corrected, record, waitsResolved, copyDamage: f.b.active.damage};
  } finally {
    restore();
    clearCopyAttackSessionsForTests();
  }
}

if (require.main === module) {
  testStaleRecordAfterPass();
  process.stdout.write(JSON.stringify({
    source: 'pinned player-turn reducer PassTurn branch',
    staleCopy: testStaleCopycatEffect(),
    actualPass: {baseline: realPassHistoryContract(false),
      corrected: realPassHistoryContract(true)},
    expectedPaper: 'Copycat cannot use an attack older than the last opponent turn',
    scope: 'Injected reducer states; not a legal turn-by-turn game',
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
  }, null, 2) + '\n');
}
module.exports = {testStaleRecordAfterPass, testStaleCopycatEffect, realPassHistoryContract};
