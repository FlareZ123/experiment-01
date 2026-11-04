'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {installMegatonBlowerHook} =
  require('../simulation/twinleaf/megaton-blower-hook.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(root, name));
const {State, GamePhase} = engine('game/store/state/state');
const {Player} = engine('game/store/state/player');
const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
const {CardList} = engine('game/store/state/card-list');
const {Store} = engine('game/store/store');
const {PlayCardAction, PlayerType, SlotType} =
  engine('game/store/actions/play-card-action');

/**
 * Staged genuine Store Item dispatch. It does not represent a dealt original
 * Aichi source game, an owner bot policy, or a qualified competitive trial.
 * The attached physical Special Energy is tracked in both native collections.
 * @param {0|1} seat
 * @param {boolean} targets
 * @param {boolean} corrected
 * @returns {object}
 */
function probe(seat, targets, corrected) {
  const manager = initializeCards();
  const card = printing => {
    const result = manager.getCardByName(printing);
    assert.ok(result, 'Missing pinned card ' + printing);
    return result;
  };
  const state = new State();
  state.players = [new Player(), new Player()];
  state.players[0].id = 101;
  state.players[1].id = 202;
  state.turn = 4 + seat;
  state.activePlayer = seat;
  state.phase = GamePhase.PLAYER_TURN;
  const actor = state.players[seat];
  const opponent = state.players[1 - seat];
  actor.active.cards.push(card('Regidrago V SIT'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const bench = new PokemonCardList();
  bench.cards.push(card('Regidrago V SIT'));
  opponent.bench.push(bench);
  const ownTool = card('Tool Jammer BST');
  actor.active.tools.push(ownTool);
  const megaton = card('Megaton Blower SSP');
  actor.hand.cards.push(megaton);
  actor.deck.cards.push(card('Psychic Energy MEE'));
  opponent.deck.cards.push(card('Psychic Energy MEE'));
  for (const player of state.players) {
    player.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      return prize;
    });
  }
  if (targets) {
    actor.stadium.cards.push(card('Sky Field ROS'));
    opponent.active.tools.push(card('Stealthy Hood UNB'));
    bench.tools.push(card('Stealthy Hood UNB'));
    const special = card('Speed Lightning Energy RCL');
    bench.cards.push(special);
    bench.energies.cards.push(special);
  }
  const store = new Store({onStateChange() {}});
  store.state = state;
  const restore = corrected ? installMegatonBlowerHook() : null;
  let error = null;
  try {
    store.dispatch(new PlayCardAction(actor.id, 0, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    }));
  } catch (e) {
    error = String(e?.message ?? e);
  } finally {
    if (restore) restore();
  }
  return {
    seat, targets, corrected,
    storeAccepted: error === null,
    error,
    handHasMegaton: actor.hand.cards.includes(megaton),
    discardHasMegaton: actor.discard.cards.includes(megaton),
    enemyTools: [
      opponent.active.tools.length,
      opponent.bench[0].tools.length
    ],
    enemySpecialCards: bench.energies.cards.length,
    stadiumCards: actor.stadium.cards.length,
    ownToolPreserved: actor.active.tools.includes(ownTool),
    opposingDiscard: opponent.discard.cards.map(c => c.fullName).sort(),
    ownDiscard: actor.discard.cards.map(c => c.fullName).sort(),
    unresolvedPrompts: state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor?.name ?? 'unknown')
  };
}

test('pinned Store Megaton keeps opponent Tools; research hook removes both, each real seat', () => {
  for (const seat of [0, 1]) {
    const raw = probe(seat, true, false);
    const corrected = probe(seat, true, true);
    console.log('AGENT1_MEGATON_STORE_TARGETS ' +
      JSON.stringify({raw, corrected}));
    assert.equal(raw.storeAccepted, true);
    assert.equal(corrected.storeAccepted, true);
    assert.deepEqual(raw.enemyTools, [1, 1]);
    assert.deepEqual(corrected.enemyTools, [0, 0]);
    for (const result of [raw, corrected]) {
      assert.equal(result.discardHasMegaton, true);
      assert.equal(result.handHasMegaton, false);
      assert.equal(result.enemySpecialCards, 0);
      assert.equal(result.stadiumCards, 0);
      assert.equal(result.ownToolPreserved, true);
      assert.deepEqual(result.unresolvedPrompts, []);
    }
    assert.equal(raw.opposingDiscard.includes('Stealthy Hood UNB'), false);
    assert.equal(corrected.opposingDiscard.filter(x =>
      x === 'Stealthy Hood UNB').length, 2);
  }
});

test('observe pinned Store Megaton with no Tool, Special Energy, or Stadium target', () => {
  for (const seat of [0, 1]) {
    const raw = probe(seat, false, false);
    const corrected = probe(seat, false, true);
    console.log('AGENT1_MEGATON_STORE_NO_TARGET ' +
      JSON.stringify({raw, corrected}));
    assert.equal(raw.ownToolPreserved, true);
    assert.equal(corrected.ownToolPreserved, true);
    assert.deepEqual(raw.enemyTools, [0, 0]);
    assert.deepEqual(corrected.enemyTools, [0, 0]);
  }
});
