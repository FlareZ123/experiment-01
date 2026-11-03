'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {planAichi} = require('../simulation/evaluation/aichi-pilot.cjs');

const native = relative => require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output', relative));
const {Store} = native('game/store/store');
const {Player} = native('game/store/state/player');
const {CardList} = native('game/store/state/card-list');
const {PokemonCardList} = native('game/store/state/pokemon-card-list');
const {GamePhase} = native('game/store/state/state');
const {Format} = native('game/store/card/card-types');
const {PlayCardAction, PlayerType, SlotType} =
  native('game/store/actions/play-card-action');
const {AttackAction} = native('game/store/actions/game-actions');
const {ResolvePromptAction} = native('game/store/actions/resolve-prompt-action');
const {CheckProvidedEnergyEffect} = native('game/store/effects/check-effects');
const {StateUtils} = native('game/store/state-utils');

const printed = planAichi(26, {
  allowEquivalentBasicEnergies: true,
  allowJapanesePromoHooks: true
}).candidate.cards;
assert.equal(printed.length, 60);
let nextId = 470000;

/**
 * Deliberately constructed two-seat native Store with the source's exact
 * Meloetta, one original Lightning, one original DCE, and Crisis Punch Tool.
 * Both attached Energy card references belong in the Pokemon main card list.
 * This fixture is not an original naturally dealt, physical 60-card game.
 * @param {0|1} seat
 * @param {boolean} withLightning
 */
function stage(seat, withLightning, orphanLightningView = false) {
  const registry = initializeCards();
  const original = name => {
    const matches = [...new Set(printed.filter(full =>
      full.startsWith(name + ' ')))];
    assert.equal(matches.length, 1, 'exact original printing of ' + name);
    const card = registry.getCardByName(matches[0]);
    assert.ok(card, 'native original card ' + matches[0]);
    card.id = nextId++;
    return card;
  };
  const other = fullName => {
    const card = registry.getCardByName(fullName);
    assert.ok(card, fullName);
    card.id = nextId++;
    return card;
  };
  const source = new Player();
  const opponent = new Player();
  source.id = 101;
  opponent.id = 202;
  for (const player of [source, opponent]) {
    player.bench = Array.from({length: 5}, () => new PokemonCardList());
    player.prizes = Array.from({length: 6}, (_, index) => {
      const slot = new CardList();
      if (player === source || index === 0) {
        slot.cards.push(other('Psychic Energy SVE'));
      }
      return slot;
    });
    for (let i = 0; i < 8; i++) {
      player.deck.cards.push(other('Psychic Energy SVE'));
    }
  }
  const meloetta = original('Meloetta ex');
  const lightning = original('Lightning Energy');
  const dce = original('Double Colorless Energy');
  const crisis = original('Technical Machine: Crisis Punch');
  source.active.cards.push(meloetta);
  if (withLightning) {
    if (!orphanLightningView) source.active.cards.push(lightning);
    source.active.energies.cards.push(lightning);
  }
  source.active.tools.push(crisis);
  source.hand.cards.push(dce);
  source.bench[0].cards.push(original('Squawkabilly ex'));
  opponent.active.cards.push(other('Shadow Rider Calyrex V CRE'));
  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.players = seat === 0 ? [source, opponent] : [opponent, source];
  state.activePlayer = seat;
  state.turn = 1;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  assert.equal(opponent.getPrizeLeft(), 1);
  assert.equal(source.active.getPokemonCard(), meloetta);
  return {seat, withLightning, store, state, source, opponent,
    meloetta, lightning, dce, crisis};
}

/** @param {ReturnType<typeof stage>} x */
function snapshot(x) {
  return {
    activeCards: x.source.active.cards.map(c => c.fullName),
    activeEnergyIds: x.source.active.energies.cards.map(c => c.id),
    sourceHandIds: x.source.hand.cards.map(c => c.id),
    dceProvides: [...x.dce.provides],
    lightningProvides: [...x.lightning.provides],
    tool: x.source.active.tools.map(c => c.fullName),
    currentTurn: x.state.turn,
    opponentPrizeCount: x.opponent.getPrizeLeft()
  };
}

/** @param {ReturnType<typeof stage>} x */
function checkPayment(x) {
  const check = new CheckProvidedEnergyEffect(x.source, x.source.active);
  x.store.reduceEffect(x.state, check);
  const energyMap = check.energyMap.map(e => ({
    cardName: e.card.fullName, provides: [...e.provides]
  }));
  const enough = StateUtils.checkEnoughEnergy(
    check.energyMap, x.crisis.attacks[0].cost);
  return {energyMap, enough, attackCost: [...x.crisis.attacks[0].cost]};
}

/** Resolve only the prompt types needed to inspect the one staged attack. */
function settle(x) {
  const seen = [];
  for (let i = 0; i < 16; i++) {
    const pending = x.state.prompts.find(p => p.result === undefined);
    if (!pending) break;
    seen.push(pending.constructor.name);
    if (pending.constructor.name === 'WaitPrompt') {
      x.store.dispatch(new ResolvePromptAction(pending.id, null));
    } else if (pending.constructor.name === 'ChoosePrizePrompt') {
      assert.equal(pending.playerId, x.source.id);
      const available = x.source.prizes.filter(p => p.cards.length > 0);
      const pick = available.slice(0, pending.options.count);
      assert.equal(pending.validate(pick, x.state), true);
      x.store.dispatch(new ResolvePromptAction(pending.id, pick));
    } else {
      throw new Error('Unexpected final-attack prompt: ' + pending.constructor.name);
    }
  }
  return seen;
}

for (const seat of [0, 1]) {
  for (const withLightning of [false, true]) {
    test('rank26 live Store original TM payment: seat ' + seat +
      ' Lightning=' + withLightning, () => {
      const x = stage(seat, withLightning);
      const before = snapshot(x);
      let attachError = null;
      try {
        x.store.dispatch(new PlayCardAction(x.source.id, 0, {
          player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
        }));
      } catch (error) {
        attachError = error.message;
      }
      const attached = snapshot(x);
      console.log('AGENT47_CRISIS_ATTACH', JSON.stringify({
        seat, withLightning, before, attachError, attached
      }));
      assert.equal(attachError, null, 'authentic DCE hand attachment must settle');
      assert.ok(x.source.active.cards.includes(x.dce));
      assert.ok(x.source.active.energies.cards.includes(x.dce));
      const payment = checkPayment(x);
      console.log('AGENT47_CRISIS_PAYMENT', JSON.stringify({
        seat, withLightning, payment, afterCheck: snapshot(x)
      }));
      assert.equal(payment.enough, withLightning,
        'printed C+C+Lightning has 3 energy; C+C alone has only 2');

      if (!withLightning) {
        let error = null;
        try {
          x.store.dispatch(new AttackAction(x.source.id, 'Crisis Punch'));
        } catch (e) { error = e.message; }
        console.log('AGENT47_CRISIS_NEGATIVE', JSON.stringify({seat, error}));
        assert.equal(error, 'NOT_ENOUGH_ENERGY');
        return; // No further use of a Store that rejected an action.
      }
      x.store.dispatch(new AttackAction(x.source.id, 'Crisis Punch'));
      const prompts = settle(x);
      const after = {
        opponentActive: x.opponent.active.getPokemonCard()?.fullName ?? null,
        opponentDamage: x.opponent.active.damage,
        sourcePrizes: x.source.getPrizeLeft(),
        statePhase: x.state.phase,
        prompts
      };
      console.log('AGENT47_CRISIS_POSITIVE', JSON.stringify({seat, after}));
      assert.equal(x.opponent.active.getPokemonCard() ?? null, null,
        'the lone 210-HP opponent should be KOed by native 280');
      assert.equal(x.source.getPrizeLeft(), 4,
        'the one native opponent V KO must award source 2 Prizes');
    });
  }
}

/**
 * Retrospective causal ablation of the older isolated fixture. A Lightning
 * present in energies.cards but absent from active.cards is an invalid physical
 * board, retained here strictly as a diagnostic negative control.
 * Each attempted AttackAction runs in a fresh Store and is never retried after
 * native rejection. Compare first-turn DCE without pre-check and with pre-check.
 */
for (const seat of [0, 1]) {
  test('rank26 firstturn native physical zone and preflight ablation seat ' + seat, () => {
    for (const orphanLightningView of [false, true]) {
      for (const preflight of [false, true]) {
        const x = stage(seat, true, orphanLightningView);
        x.store.dispatch(new PlayCardAction(x.source.id, 0, {
          player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
        }));
        const attachment = snapshot(x);
        const payment = preflight ? checkPayment(x) : null;
        let attackError = null;
        try {
          x.store.dispatch(new AttackAction(x.source.id, 'Crisis Punch'));
        } catch (error) {
          attackError = error.message;
        }
        const record = {seat, orphanLightningView, preflight,
          attachment, payment, attackError,
          sourcePrizes: x.source.getPrizeLeft(),
          opponentActiveAfter: x.opponent.active.getPokemonCard()?.fullName ?? null,
          opponentPhase: x.state.phase};
        console.log('AGENT47_CRISIS_ABLATION', JSON.stringify(record));
        if (!orphanLightningView) {
          assert.equal(attackError, null,
            'real Energy card must be attached in both native physical views');
          assert.equal(x.opponent.active.getPokemonCard() ?? null, null);
        }
      }
    }
  });
}
