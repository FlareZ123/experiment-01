'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');

const ROOT = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native = name => require(path.join(ROOT, name));

/**
 * Staged actual Store only. The card pool, owners, costs and effects are real;
 * this is not a shuffled 60-card opening or a competitively qualified match.
 * @param {0|1} attackingSeat
 * @param {2|3} psychicCount
 * @param {boolean} gxAlreadyUsed
 */
function stage(attackingSeat, psychicCount, gxAlreadyUsed) {
  const { Store } = native('game/store/store');
  const { State, GamePhase } = native('game/store/state/state');
  const { Player } = native('game/store/state/player');
  const { CardList } = native('game/store/state/card-list');
  const { GameSettings } = native('game/core/game-settings');
  const { Format } = native('game/store/card/card-types');
  const cards = initializeCards();
  let id = 340000 + attackingSeat * 1000 + psychicCount * 100;
  /** @param {string} name */
  function get(name) {
    const card = cards.getCardByName(name);
    assert.ok(card, 'Unregistered pinned card: ' + name);
    card.id = id++;
    return card;
  }
  const attacker = new Player();
  const defender = new Player();
  attacker.id = attackingSeat === 0 ? 101 : 202;
  defender.id = attackingSeat === 0 ? 202 : 101;
  attacker.active.cards.push(get('Trevenant & Dusknoir-GX SMP'));
  defender.active.cards.push(get('Rotom V LOR'));
  for (let i = 0; i < psychicCount; i++) {
    const energy = get('Psychic Energy SVE');
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  for (let i = 0; i < 2; i++) {
    const energy = get('Lightning Energy SVE');
    defender.active.cards.push(energy);
    defender.active.energies.cards.push(energy);
  }
  for (const owner of [attacker, defender]) {
    for (let j = 0; j < 8; j++) owner.deck.cards.push(get('Psychic Energy SVE'));
    for (let j = 0; j < 6; j++) {
      const prize = new CardList();
      prize.cards.push(get('Psychic Energy SVE'));
      owner.prizes.push(prize);
    }
  }
  attacker.usedGX = gxAlreadyUsed;
  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  const state = new State();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = attackingSeat;
  state.players = attackingSeat === 0 ? [attacker, defender] : [defender, attacker];
  const store = new Store({ onStateChange() {} });
  store.state = state;
  return {store, state, attacker, defender};
}

for (const seat of [0, 1]) {
  for (const psychicCount of [2, 3]) {
    test('native direct Pale Moon-GX first use, seat ' + seat + ' psychic ' + psychicCount, () => {
      const { AttackAction } = native('game/store/actions/game-actions');
      const f = stage(seat, psychicCount, false);
      const attack = f.attacker.active.getPokemonCard().attacks
        .find(a => a.name === 'Pale Moon-GX');
      assert.ok(attack);
      assert.equal(attack.gxAttack, undefined, 'metadata discrepancy must remain visible');
      f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
      assert.equal(f.attacker.usedGX, true, 'actual first attack must spend game GX');
      assert.equal(f.defender.pendingEndOfTurnEffects.length, 1,
        'must arm delayed KO against original defending slot');
      const pending = f.defender.pendingEndOfTurnEffects[0];
      assert.equal(pending.type, 'knock_out');
      assert.strictEqual(pending.target, f.defender.active);
      assert.equal(f.defender.active.getPokemonCard().name, 'Rotom V');
      const retained = f.defender.active.energies.cards.length;
      assert.equal(retained, psychicCount === 2 ? 2 : 0,
        'extra Psychic triggers separate immediate Energy discard only');
      console.log('AGENT34_PALE_MOON_GX_NATIVE', JSON.stringify({
        seat, psychicCount, nativeFirstUseAccepted: true,
        attackerUsedGX: f.attacker.usedGX, pendingType: pending.type,
        defenderActiveEnergyRemaining: retained,
        qualifiedCompetitiveGames: 0
      }));
    });
  }
  test('native direct Pale Moon-GX denies second GX, seat ' + seat, () => {
    const { AttackAction } = native('game/store/actions/game-actions');
    const { GameMessage } = native('game/game-message');
    const f = stage(seat, 2, true);
    assert.throws(() => f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX')),
      error => error?.message === GameMessage.LABEL_GX_USED,
      'second GX attempt must specifically fail with LABEL_GX_USED');
    assert.equal(f.store.state.players[seat].usedGX, true);
    assert.equal(f.store.state.players[1-seat].pendingEndOfTurnEffects.length, 0);
    console.log('AGENT34_PALE_MOON_GX_REPEAT_VETO', JSON.stringify({
      seat, secondUseDenied: true, expectedCode: GameMessage.LABEL_GX_USED,
      qualifiedCompetitiveGames: 0
    }));
  });
}


for (const seat of [0, 1]) {
  test('native delayed Pale Moon target after an opponent Active-to-Bench switch, seat ' + seat, () => {
    const { AttackAction } = native('game/store/actions/game-actions');
    const { EndTurnEffect } = native('game/store/effects/game-phase-effects');
    const { RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS } =
      native('game/store/prefabs/attack-effects');
    const f = stage(seat, 2, false);
    const { PokemonCardList } = native('game/store/state/pokemon-card-list');
    f.defender.bench.push(new PokemonCardList());
    const formerActive = f.defender.active;
    const replacingCard = initializeCards().getCardByName('Rotom V LOR');
    assert.ok(replacingCard);
    replacingCard.id = 345678 + seat;
    f.defender.bench[0].cards.push(replacingCard);
    f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
    assert.equal(f.defender.pendingEndOfTurnEffects.length, 1);
    assert.strictEqual(f.defender.pendingEndOfTurnEffects[0].target, formerActive);
    f.defender.switchPokemon(f.defender.bench[0], f.store, f.state);
    assert.strictEqual(f.defender.bench[0], formerActive);
    assert.equal(f.defender.active.getPokemonCard().name, 'Rotom V');
    const retainedQueue = f.defender.pendingEndOfTurnEffects.length;
    const oldBenchPresentBefore = !!f.defender.bench[0].getPokemonCard();
    RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS(
      f.store, f.state, new EndTurnEffect(f.defender));
    const oldBenchPresentAfter = !!f.defender.bench[0].getPokemonCard();
    const defenderDiscardNames = f.defender.discard.cards.map(c => c.name);
    console.log('AGENT34_PALE_MOON_SWITCH_NATIVE', JSON.stringify({
      seat, retiredTargetWasBenched: true, retainedQueue,
      oldBenchPresentBefore, oldBenchPresentAfter,
      defenderDiscardNames,
      remainingPending: f.defender.pendingEndOfTurnEffects.length,
      paperLegalityUnqualified: true,
      competitiveGamesQualified: 0
    }));
    assert.equal(retainedQueue, 1,
      'pinned engine retains delayed KO queue after defender switches');
    assert.equal(oldBenchPresentBefore, true);
    assert.equal(oldBenchPresentAfter, false,
      'pinned delayed resolver actually knocks out retreated Bench Pokemon');
    assert.ok(defenderDiscardNames.includes('Rotom V'));
  });
}
