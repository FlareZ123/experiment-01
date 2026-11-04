'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { installMegatonBlowerHook } =
  require('../simulation/twinleaf/megaton-blower-hook.cjs');
const { withMegatonNoEffectRootGuard } =
  require('../simulation/twinleaf/agent1-megaton-no-effect-root-guard.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const load = name => require(path.join(root, name));
const { State, GamePhase } = load('game/store/state/state');
const { Player } = load('game/store/state/player');
const { CardList } = load('game/store/state/card-list');
const { PokemonCardList } = load('game/store/state/pokemon-card-list');
const { Store } = load('game/store/store');
const { Format } = load('game/store/card/card-types');
const { PlayCardAction, PlayerType, SlotType } =
  load('game/store/actions/play-card-action');

/**
 * Staged Tool-enabled Garbotoxin suppresses own Benched Vileplume lock when
 * Megaton begins. The same Megaton must finish removing a second Tool, the
 * opponent's Special Energy and the Stadium as Garbotoxin is disabled.
 * Test each physical seat and whether the Garbodor is Active or Benched.
 * @param {0|1} seat Item owner seat.
 * @param {boolean} garbodorActive Opponent's active/bench order.
 * @param {boolean} correction Whether research-owned Tool fix is installed.
 * @returns {object} Real Store action, target and prompt receipts.
 */
function probe(seat, garbodorActive, correction) {
  const manager = initializeCards();
  const card = name => {
    const item = manager.getCardByName(name);
    assert.ok(item, 'Missing pinned printing ' + name);
    return item;
  };
  const state = new State();
  state.players = [new Player(), new Player()];
  const actor = state.players[seat];
  const opponent = state.players[1 - seat];
  actor.id = 101;
  opponent.id = 202;
  state.activePlayer = seat;
  state.turn = 4 + seat;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  actor.active.cards.push(card('Bunnelby PRC'));
  const flower = new PokemonCardList();
  flower.cards.push(card('Oddish UNB'), card('Gloom UNB'),
    card('Vileplume AOR'));
  actor.bench.push(flower);

  const trash = new PokemonCardList();
  trash.cards.push(card('Trubbish BKP'), card('Garbodor BKP'));
  trash.tools.push(card('Float Stone BKT'));
  const dragon = new PokemonCardList();
  dragon.cards.push(card('Regidrago V SIT'));
  dragon.tools.push(card('Stealthy Hood UNB'));
  const dde = card('Double Dragon Energy ROS');
  dragon.cards.push(dde);
  dragon.energies.cards.push(dde);
  opponent.active = garbodorActive ? trash : dragon;
  opponent.bench.push(garbodorActive ? dragon : trash);

  actor.stadium.cards.push(card('Sky Field ROS'));
  actor.hand.cards.push(card('Megaton Blower SSP'), card('Switch SVI'));
  for (const p of state.players) {
    p.deck.cards.push(card('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }

  const store = new Store({onStateChange() {}});
  store.state = state;
  const restore = correction ? installMegatonBlowerHook() : null;
  let megatonError = null, switchError = null, audit = null;
  try {
    const attempt = withMegatonNoEffectRootGuard(() => {
      try {
        store.dispatch(new PlayCardAction(actor.id, 0, {
          player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
        }));
      } catch (error) {
        megatonError = String(error?.message ?? error);
      }
      try {
        const owner = store.state.players.find(p => p.id === actor.id);
        const index = owner.hand.cards.findIndex(c => c.fullName === 'Switch SVI');
        assert.ok(index >= 0, 'Switch must remain physically held');
        store.dispatch(new PlayCardAction(actor.id, index, {
          player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
        }));
      } catch (error) {
        switchError = String(error?.message ?? error);
      }
    });
    audit = attempt.audit;
  } finally {
    if (restore) restore();
  }
  const nowActor = store.state.players.find(p => p.id === actor.id);
  const nowOpponent = store.state.players.find(p => p.id === opponent.id);
  const slots = [nowOpponent.active, ...nowOpponent.bench];
  const garbo = slots.find(slot =>
    slot.getPokemonCard()?.fullName === 'Garbodor BKP');
  const reg = slots.find(slot =>
    slot.getPokemonCard()?.fullName === 'Regidrago V SIT');
  assert.ok(garbo && reg);
  return {
    seat, garbodorActive, correction, megatonError, switchError, audit,
    garbodorTools: garbo.tools.map(c => c.fullName),
    dragonTools: reg.tools.map(c => c.fullName),
    dragonEnergy: reg.energies.cards.map(c => c.fullName),
    opponentDiscard: nowOpponent.discard.cards.map(c => c.fullName).sort(),
    stadium: nowActor.stadium.cards.map(c => c.fullName),
    ownerDiscard: nowActor.discard.cards.map(c => c.fullName).sort(),
    switchInHand: nowActor.hand.cards.some(c => c.fullName === 'Switch SVI'),
    unresolvedPrompts: store.state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor?.name ?? 'unknown')
  };
}

test('Megaton fully resolves all target categories while disabling Garbotoxin mid-effect', () => {
  const rows = [];
  for (const seat of [0, 1]) {
    for (const garbodorActive of [false, true]) {
      const raw = probe(seat, garbodorActive, false);
      const corrected = probe(seat, garbodorActive, true);
      rows.push({raw, corrected});
      for (const result of [raw, corrected]) {
        assert.equal(result.megatonError, null);
        assert.deepEqual(result.dragonEnergy, []);
        assert.deepEqual(result.stadium, []);
        assert.equal(result.opponentDiscard.includes('Double Dragon Energy ROS'), true);
        assert.equal(result.ownerDiscard.includes('Megaton Blower SSP'), true);
        assert.equal(result.ownerDiscard.includes('Sky Field ROS'), true);
        assert.equal(result.audit.inspectedMegatonActions, 1);
        assert.equal(result.audit.rejectedProvenNoEffect, 0);
      }
      assert.deepEqual(raw.garbodorTools, ['Float Stone BKT']);
      assert.deepEqual(raw.dragonTools, ['Stealthy Hood UNB']);
      assert.equal(raw.switchError, null);
      assert.equal(raw.switchInHand, false);
      assert.deepEqual(raw.unresolvedPrompts, ['ChoosePokemonPrompt']);
      assert.deepEqual(corrected.garbodorTools, []);
      assert.deepEqual(corrected.dragonTools, []);
      assert.equal(corrected.opponentDiscard.includes('Float Stone BKT'), true);
      assert.equal(corrected.opponentDiscard.includes('Stealthy Hood UNB'), true);
      assert.equal(corrected.switchError, 'CANNOT_PLAY_THIS_CARD');
      assert.equal(corrected.switchInHand, true);
      assert.deepEqual(corrected.unresolvedPrompts, []);
    }
  }
  console.log('AGENT1_MEGATON_MID_EFFECT_LOCK_MATRIX ' +
    JSON.stringify({count: rows.length, rows}));
});

module.exports = { probe };
