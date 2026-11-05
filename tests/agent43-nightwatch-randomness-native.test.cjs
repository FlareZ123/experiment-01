'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');

const BASE = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native = name => require(path.join(BASE, name));

/**
 * Isolate pinned Night Watch with three distinguishable opponent hand cards.
 * Staged Store position, never a naturally dealt or competitively qualified game.
 * @param {0|1} attackerSeat
 */
function stage(attackerSeat) {
  const { Store } = native('game/store/store');
  const { State, GamePhase } = native('game/store/state/state');
  const { Player } = native('game/store/state/player');
  const { GameSettings } = native('game/core/game-settings');
  const { Format } = native('game/store/card/card-types');
  const { CardList } = native('game/store/state/card-list');
  const manager = initializeCards();
  let nextId = 430000 + attackerSeat * 100;
  /** @param {string} fullName */
  function get(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'Unregistered pinned card: ' + fullName);
    card.id = nextId++;
    return card;
  }
  const attacker = new Player();
  const defender = new Player();
  attacker.id = attackerSeat === 0 ? 101 : 202;
  defender.id = attackerSeat === 0 ? 202 : 101;
  attacker.active.cards.push(get('Trevenant & Dusknoir-GX SMP'));
  defender.active.cards.push(get('Rotom V LOR'));
  for (let i = 0; i < 3; i++) {
    const energy = get('Psychic Energy SVE');
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  const opponentHand = [
    get('Psychic Energy SVE'),
    get('Water Energy SVE'),
    get('Grass Energy SVE')
  ];
  defender.hand.cards.push(...opponentHand);
  for (const player of [attacker, defender]) {
    for (let i = 0; i < 8; i++) player.deck.cards.push(get('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const slot = new CardList();
      slot.cards.push(get('Psychic Energy SVE'));
      player.prizes.push(slot);
    }
  }
  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  const state = new State();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = attackerSeat;
  state.players = attackerSeat === 0 ? [attacker, defender] : [defender, attacker];
  const store = new Store({ onStateChange() {} });
  store.state = state;
  return { store, state, attacker, defender, opponentHand };
}

/**
 * Distinct attacker-driven selections from otherwise identical Store states.
 * @param {0|1} attackerSeat
 * @param {[number,number]} indices
 */
function run(attackerSeat, indices) {
  const { AttackAction } = native('game/store/actions/game-actions');
  const { ResolvePromptAction } = native('game/store/actions/resolve-prompt-action');
  const f = stage(attackerSeat);
  f.store.dispatch(new AttackAction(f.attacker.id, 'Night Watch'));
  const prompt = f.state.prompts.find(p => p.result === undefined);
  assert.equal(prompt?.constructor.name, 'ChooseCardsPrompt');
  assert.equal(prompt.playerId, f.attacker.id,
    'Native choice belongs to attacker instead of internal random sampler');
  assert.strictEqual(prompt.cards, f.defender.hand);
  assert.equal(prompt.options.min, 2);
  assert.equal(prompt.options.max, 2);
  assert.equal(prompt.options.isSecret, true);
  assert.equal(prompt.validate([f.opponentHand[0], f.opponentHand[1]], f.state), true);
  assert.equal(prompt.validate([f.opponentHand[0], f.opponentHand[2]], f.state), true);
  const chosen = indices.map(i => f.opponentHand[i]);
  f.store.dispatch(new ResolvePromptAction(prompt.id, chosen));
  const unselected = f.opponentHand.filter(c => !chosen.includes(c));
  assert.deepEqual(f.defender.hand.cards, unselected);
  assert.ok(chosen.every(c => f.defender.deck.cards.includes(c)));
  return {
    attackerSeat, choices: indices,
    promptActor: prompt.playerId, attackOwner: f.attacker.id,
    handBefore: f.opponentHand.map(c => c.name),
    handAfter: f.defender.hand.cards.map(c => c.name),
    chosenToDeck: chosen.map(c => c.name),
    pendingAfterMove: f.state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor.name),
    qualification: 'staged native effect; zero qualified games'
  };
}

for (const attackerSeat of [0, 1]) {
  test('Pinned Night Watch permits distinct attacker-selected hand pairs on seat ' + attackerSeat, () => {
    const a = run(attackerSeat, [0, 1]);
    const b = run(attackerSeat, [0, 2]);
    assert.notDeepEqual(a.handAfter, b.handAfter);
    assert.equal(a.promptActor, a.attackOwner);
    assert.equal(b.promptActor, b.attackOwner);
    console.log('AGENT43_NIGHTWATCH_NATIVE', JSON.stringify({
      attackerSeat, first: a, second: b,
      nativeChoiceDiscretionDemonstrated: true,
      paperRandomSelectionDemonstrated: false,
      competitivelyQualifiedGames: 0
    }));
  });
}
