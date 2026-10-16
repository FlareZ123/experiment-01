'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { withToolAttackAwareness } = require('./tool-attack-policy.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/** Stage a legitimate attack-payment state, without implying legal setup. */
function preparedToolAttack() {
  const cards = initializeCards();
  const get = fullName => {
    const card = cards.getCardByName(fullName);
    assert.ok(card, 'Pinned Twinleaf card missing: ' + fullName);
    return card;
  };
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { CardList } = load('game/store/state/card-list');
  const { GamePhase } = load('game/store/state/state');
  const { Format } = load('game/store/card/card-types');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 0;
  state.gameSettings.format = Format.EXPANDED;
  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'Meloetta Tool player';
  const defender = new Player();
  defender.id = 202;
  defender.name = 'Defending Shadow Rider';
  state.players = [attacker, defender];
  const meloetta = get('Meloetta ex SV11B');
  const tm = get('Technical Machine: Crisis Punch PAF');
  attacker.active.cards.push(meloetta);
  attacker.active.tools.push(tm);
  defender.active.cards.push(get('Shadow Rider Calyrex VMAX CRE'));
  const psychic = cards.getAllCards().find(card =>
    card.name === 'Psychic Energy' && card.set === 'MEE');
  assert.ok(psychic, 'Need genuine Basic Psychic Energy');
  for (let i = 0; i < 3; i += 1) {
    const energy = get(psychic.fullName);
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  /** @returns {object} */
  const prize = () => {
    const list = new CardList();
    list.cards.push(get('Dratini OBF'));
    return list;
  };
  attacker.prizes = Array.from({length: 6}, prize);
  defender.prizes = [prize()];
  attacker.deck.cards.push(get('Dratini OBF'));
  defender.deck.cards.push(get('Dratini OBF'));

  // IDs are unique in real games; reproduce that property in a staged test.
  let nextId = 1;
  for (const player of [attacker, defender]) {
    for (const zone of [
      player.active, player.hand, player.deck, player.discard,
      ...player.prizes
    ]) {
      for (const card of zone.cards) card.id = nextId++;
    }
    for (const card of player.active.tools) card.id = nextId++;
  }
  return {cards, store, state, attacker, defender, meloetta, tm};
}

/**
 * Return the actual next action chosen by the default or opt-in policy.
 * @param {ReturnType<typeof preparedToolAttack>} fixture
 * @param {boolean} awareness
 */
function nextAction(fixture, awareness = false) {
  const { SimpleTacticsAi } = load('simple-bot/simple-tactics-ai');
  const defs = load('simple-bot/simple-bot-definitions');
  const options = {
    tactics: defs.allSimpleTactics,
    promptResolvers: defs.allPromptResolvers,
    scores: defs.defaultStateScores,
    arbiter: defs.defaultArbiterOptions
  };
  const effective = awareness ? withToolAttackAwareness(options) : options;
  const bot = new SimpleTacticsAi({id: fixture.attacker.id}, effective, null);
  return bot.decodeNextAction(fixture.state);
}

/** Source-faithful, real-store card and policy characterization. */
function characterizeToolAttackPolicy() {
  const { CheckPokemonAttacksEffect } = load('game/store/effects/check-effects');
  const fixture = preparedToolAttack();
  const supplied = new CheckPokemonAttacksEffect(fixture.attacker).attacks;
  assert.ok(supplied.some(attack => attack.name === 'Crisis Punch'));
  assert.ok(!fixture.meloetta.attacks.some(attack => attack.name === 'Crisis Punch'));

  const defaultAction = nextAction(fixture, false);
  assert.notEqual(defaultAction?.name, 'Crisis Punch',
    'Source-only default AttackTactic cannot enumerate Tool attacks');

  const correctedAction = nextAction(fixture, true);
  assert.equal(correctedAction?.constructor.name, 'AttackAction');
  assert.equal(correctedAction?.name, 'Crisis Punch',
    'Opt-in tactic must see and select a legal 280-damage Tool attack');

  fixture.store.dispatch(correctedAction);
  assert.equal(fixture.defender.active.damage, 280,
    'Actual engine must apply Crisis Punch damage in staged state');

  return {
    verified: true,
    state: 'turn 4, 3 Basic Psychic attached, TM Crisis Punch, defender has 1 Prize',
    defaultAction: defaultAction?.constructor.name || null,
    defaultAttack: defaultAction?.name || null,
    optInAction: correctedAction.constructor.name,
    optInAttack: correctedAction.name,
    dealtDamage: fixture.defender.active.damage,
    caveat: 'staged midgame card payment and policy selection, not a full-game win'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(characterizeToolAttackPolicy(), null, 2));
}

module.exports = {preparedToolAttack, nextAction, characterizeToolAttackPolicy};
