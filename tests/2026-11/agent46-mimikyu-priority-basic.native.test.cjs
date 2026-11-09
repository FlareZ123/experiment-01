'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../../simulation/twinleaf/headless.cjs');
const {mimikyuPriorityHandIndex, installMimikyuPriorityBasic} =
  require('../../simulation/twinleaf/2026-11/agent46-mimikyu-priority-basic.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native = name => require(path.join(output, name));

/**
 * Make a native owner/Regidrago board with a deliberately first-in-hand
 * Dialga-GX competing for the same Bench slot as Mimikyu.
 * @param {0|1} seat
 * @returns {object}
 */
function fixture(seat) {
  const manager = initializeCards();
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Pinned card unavailable: ' + name);
    return result;
  };
  const {Store} = native('game/store/store');
  const {Player} = native('game/store/state/player');
  const {PokemonCardList} = native('game/store/state/pokemon-card-list');
  const {CardList} = native('game/store/state/card-list');
  const {GamePhase} = native('game/store/state/state');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const owner = new Player();
  owner.id = seat === 0 ? 101 : 202;
  const opponent = new Player();
  opponent.id = seat === 0 ? 202 : 101;
  state.players = seat === 0 ? [owner, opponent] : [opponent, owner];
  // Nonempty physical Prizes prevent the native empty-Prize sudden-death
  // reset from swallowing this otherwise legal mid-game action fixture.
  for (const player of state.players) {
    player.prizes = Array.from({length:6}, () =>
      CardList.fromList(['Psychic Energy SVE']));
    player.deck = CardList.fromList(Array(12).fill('Psychic Energy SVE'));
  }
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = seat;
  state.turn = 4;
  owner.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  owner.hand.cards.push(card('Dialga-GX UPR'), card('Mimikyu GRI'));
  owner.bench.push(new PokemonCardList());
  opponent.bench.push(new PokemonCardList());
  const definitions = native('simple-bot/simple-bot-definitions');
  const {PlayBasicTactic} = native('simple-bot/simple-tactics/play-basic-tactic');
  const tactic = new PlayBasicTactic({
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: definitions.defaultArbiterOptions
  });
  return {state, store, owner, opponent, card, tactic, seat};
}

for (const seat of [0, 1]) {
  test('native original Mimikyu gains the first Bench slot in seat ' + seat, () => {
    const f = fixture(seat);
    assert.equal(mimikyuPriorityHandIndex(f.state, f.owner), 1);
    const baseline = f.tactic.useTactic(f.state, f.owner);
    assert.equal(baseline.handIndex, 0, 'Pinned default chooses the first Basic');
    const restore = installMimikyuPriorityBasic({seat});
    try {
      assert.strictEqual(installMimikyuPriorityBasic({seat}), restore);
      const action = f.tactic.useTactic(f.state, f.owner);
      assert.equal(action.type, 'PLAY_CARD_ACTION');
      assert.equal(action.handIndex, 1);
      assert.equal(action.id, f.owner.id);
      const next = f.store.dispatch(action);
      const ownerAfter = next.players.find(p => p.id === f.owner.id);
      const benchCards = ownerAfter.bench.flatMap(slot => slot.cards.map(c => c.fullName));
      const handCards = ownerAfter.hand.cards.map(c => c.fullName);
      const movement = {benchCards, handCards,
        target: action.target,
        ownerId: ownerAfter.id,
        allBoards: next.players.map(p => ({id:p.id,
          bench:p.bench.flatMap(slot => slot.cards.map(c => c.fullName))}))};
      assert.ok(benchCards.includes('Mimikyu GRI'), JSON.stringify(movement));
      assert.deepEqual(handCards, ['Dialga-GX UPR'], JSON.stringify(movement));
    } finally {
      restore();
      restore();
    }
    assert.equal(f.tactic.useTactic(f.state, f.owner), undefined);
  });

  test('no interference with opponent, empty opportunity or non-Regidrago in seat ' + seat, () => {
    const f = fixture(seat);
    const restore = installMimikyuPriorityBasic({seat});
    try {
      const other = f.tactic.useTactic(f.state, f.opponent);
      assert.equal(other, undefined, 'Opponent has no Basic to bench');
      f.opponent.active.cards.length = 0;
      f.opponent.active.cards.push(f.card('Dratini OBF'));
      assert.equal(mimikyuPriorityHandIndex(f.state, f.owner), -1);
      assert.equal(f.tactic.useTactic(f.state, f.owner).handIndex, 0);
      f.opponent.active.cards.length = 0;
      f.opponent.active.cards.push(f.card('Regidrago VSTAR SIT'));
      f.owner.bench[0].cards.push(f.card('Latias ex SSP'));
      assert.equal(mimikyuPriorityHandIndex(f.state, f.owner), -1);
      assert.equal(f.tactic.useTactic(f.state, f.owner), undefined);
      assert.throws(() => installMimikyuPriorityBasic({seat:1-seat}),
        /Conflicting Mimikyu priority/);
    } finally {
      restore();
    }
  });
}
