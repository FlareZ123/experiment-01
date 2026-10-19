'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename */
const load = filename => require(path.join(output, filename));

/**
 * Keep the published rank-11 60 fully accounted for while moving four
 * unrevealed Trainers or four unrevealed Energy between its hand and deck.
 * The opposing (attacking) player observes the same board, hand size,
 * deck size, six Prize backs, and its own zones in both alternatives.
 *
 * A native Gengar attack isolates printed Poltergeist. This deliberately
 * does not claim that New Moon's delegated Perfection policy uses the same
 * attack-tactic evaluator, or that the board arose in a natural game.
 *
 * @param {boolean} trainersInOpponentHand
 */
function makeFixture(trainersInOpponentHand) {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const rank11 = field.decks.find(row => row.rank === 11);
  assert.equal(rank11?.playableUnderEngine, true);
  assert.equal(rank11.cardIds.length, 60);
  const remaining = [...rank11.cardIds];
  const manager = initializeCards();
  let uid = 1;
  /** @param {string} fullName */
  function make(fullName) {
    const c = manager.getCardByName(fullName);
    assert.ok(c, 'Missing printed card ' + fullName);
    c.id = uid++;
    return c;
  }
  /** @param {string} fullName */
  function take(fullName) {
    const index = remaining.findIndex(name =>
      name === fullName || name.startsWith(fullName + ' '));
    assert.ok(index >= 0, 'Published rank 11 lacks ' + fullName);
    const [resolvedName] = remaining.splice(index, 1);
    return make(resolvedName);
  }

  const active = take('Mega Absol ex MEG');
  const benched = take('Oranguru V ASR');
  const trainers = Array.from({length: 4},
    () => take('Battle VIP Pass FST'));
  const energies = Array.from({length: 4},
    () => take('Darkness Energy MEE'));
  const prizeCards = Array.from({length: 6}, () => take(remaining[0]));
  const sourceHand = trainersInOpponentHand ? trainers : energies;
  const sourceDeck = trainersInOpponentHand ? [...energies, ...remaining.map(make)] :
    [...trainers, ...remaining.map(make)];

  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'Printed Gengar researcher';
  const defender = new Player();
  defender.id = 202;
  defender.name = 'Published rank-11 source';
  state.players = [attacker, defender];
  state.turn = 4;
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  attacker.active.cards.push(make('Gengar & Mimikyu-GX TEU'));
  for (let i = 0; i < 2; i++) {
    const psychic = make('Psychic Energy MEE');
    attacker.active.cards.push(psychic);
    attacker.active.energies.cards.push(psychic);
  }
  attacker.usedGX = true; // Isolate the non-GX printed attack comparison.
  for (let i = 0; i < 6; i++) {
    const pile = new CardList();
    pile.cards.push(make('Psychic Energy MEE'));
    attacker.prizes.push(pile);
  }
  for (let i = 0; i < 12; i++) {
    attacker.deck.cards.push(make('Psychic Energy MEE'));
  }

  defender.active.cards.push(active);
  defender.bench[0].cards.push(benched);
  defender.hand.cards.push(...sourceHand);
  defender.deck.cards.push(...sourceDeck);
  defender.prizes = prizeCards.map(card => {
    const pile = new CardList();
    pile.cards.push(card);
    return pile;
  });

  const physical = [active.fullName, benched.fullName,
    ...defender.hand.cards.map(c => c.fullName),
    ...defender.deck.cards.map(c => c.fullName),
    ...prizeCards.map(c => c.fullName)].sort();
  assert.deepEqual(physical, [...rank11.cardIds].sort(),
    'Each hidden alternative must preserve the entire exact rank-11 60');

  return {state, attacker, defender, sourceDigest:physical.join('|'),
    sourceRank:rank11.rank, sourcePlayer:rank11.player};
}

/** @param {ReturnType<typeof makeFixture>} sample */
function observation(sample) {
  const {attacker, defender} = sample;
  return {
    myActive:attacker.active.getPokemonCard()?.fullName,
    myAttachedEnergy:attacker.active.energies.cards.map(c => c.fullName),
    myHand:attacker.hand.cards.map(c => c.fullName),
    myDeckCount:attacker.deck.cards.length,
    myUsedGX:attacker.usedGX,
    opponentActive:defender.active.getPokemonCard()?.fullName,
    opponentBench:defender.bench.map(slot =>
      slot.getPokemonCard()?.fullName || null),
    opponentHandCount:defender.hand.cards.length,
    opponentDeckCount:defender.deck.cards.length,
    opponentPrizeCount:defender.prizes.filter(p => p.cards.length).length,
    turn:sample.state.turn
  };
}

/** @returns {object} Pinned-engine speculative opponent-hand inference audit. */
function audit() {
  const hands = [makeFixture(false), makeFixture(true)];
  assert.deepEqual(observation(hands[0]), observation(hands[1]));
  assert.equal(hands[0].sourceDigest, hands[1].sourceDigest);
  const {AttackTactic} =
    load('simple-bot/simple-tactics/attack-tactic');
  const {AttackAction} =
    load('game/store/actions/game-actions');
  const defs = load('simple-bot/simple-bot-definitions');
  const options = {
    tactics:defs.allSimpleTactics,
    promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,
    arbiter:defs.defaultArbiterOptions
  };
  const baseline = hands.map(s =>
    new AttackTactic(options).getStateScore(s.state, s.attacker.id));
  assert.equal(baseline[0], baseline[1],
    'Actual, pre-action score must ignore unknown opponent-hand identity');

  const prospective = hands.map(s => {
    const tactic = new AttackTactic(options);
    const action = new AttackAction(s.attacker.id, 'Poltergeist');
    const score = tactic.evaluateAction(s.state, s.attacker.id, action);
    assert.equal(typeof score, 'number',
      'Printed Poltergeist must resolve in a hypothetical pinned Store');
    const chosen = tactic.useTactic(s.state, s.attacker);
    return {
      opponentHiddenTrainers:s.defender.hand.cards.filter(c =>
        c.trainerType !== undefined).length,
      poltergeistScore:score,
      selectedActionClass:chosen?.constructor.name || null,
      selectedAttack:chosen?.attack || chosen?.attackName || null
    };
  });
  assert.equal(prospective[0].opponentHiddenTrainers, 0);
  assert.equal(prospective[1].opponentHiddenTrainers, 4);
  assert.notEqual(prospective[0].poltergeistScore,
    prospective[1].poltergeistScore,
    'Hypothetical attacker score must reveal a pre-attack hidden hand difference');
  return {
    schema:'rank11-hidden-opponent-hand-poltergeist-speculation-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:11,
    sourcePlayer:hands[0].sourcePlayer,
    sourceInventoryCards:60,
    sameAttackerObservation:true,
    sameSourceCardMultiset:true,
    baselineScore:baseline[0],
    variants:prospective,
    preAttackHiddenHandForecastLeak:true,
    qualification:'Native Gengar conditional staged board only. Not a source-dealt game, not a tested Mewtwo Perfection policy, and not competitive win-rate evidence.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(audit(), null, 2) + '\n');
}
module.exports = {makeFixture, observation, audit};
