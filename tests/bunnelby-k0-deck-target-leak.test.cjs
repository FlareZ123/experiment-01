'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {hasBenchEvolutionTarget} =
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');

/**
 * Two unresolved K0 partitions can present the identical public board, own
 * hand, number of unrevealed Prizes, and number of unseen deck cards.
 * `hasBenchEvolutionTarget` receives the engine's inaccessible deck identity.
 * @param {boolean} evolutionInDeck
 */
function k0Player(evolutionInDeck) {
  const bloom = {name: 'Vileplume', fullName: 'Vileplume AOR',
    evolvesFrom: 'Gloom', stage: 2};
  const neutral = {name: 'Artazon', fullName: 'Artazon PAL'};
  return {
    bench: [{getPokemonCard: () => ({name: 'Gloom'})}],
    deck: {cards: [evolutionInDeck ? bloom : neutral]},
    prizes: [{cards: [evolutionInDeck ? neutral : bloom]}],
    hand: {cards: [{name: 'Cassius'}]}
  };
}

test('Bunnelby opt-in K0 gate reads otherwise hidden Prize/deck partition', () => {
  const first = k0Player(true);
  const second = k0Player(false);
  assert.equal(first.bench[0].getPokemonCard().name,
    second.bench[0].getPokemonCard().name);
  assert.deepEqual(first.hand.cards, second.hand.cards);
  assert.equal(first.deck.cards.length, second.deck.cards.length);
  assert.equal(first.prizes.length, second.prizes.length);
  assert.equal(hasBenchEvolutionTarget(first), true);
  assert.equal(hasBenchEvolutionTarget(second), false);
});


/**
 * Use the real rank-2 source copy counts with the exact known Gloom print.
 * Other names are deliberately left without stage metadata: Oddish's immediate
 * eligible source-card stage is all this K0 counterexample needs to establish.
 */
function rank2Source() {
  const deck = require('../results/aichi-2026/full-decklists.json')
    .decks.find(entry => entry.rank === 2);
  const cards = deck.cards.flatMap(entry => Array.from({length: entry.count}, () => ({
    name: entry.name,
    fullName: entry.name + ' ' + entry.printing.set,
    ...(entry.name === 'Gloom' ? {stage: 1, evolvesFrom: 'Oddish'} : {})
  })));
  assert.equal(cards.length, 60);
  assert.equal(cards.filter(card => card.name === 'Gloom').length, 2);
  return cards;
}

/** The trap deliberately denies the AI access to both hidden zones. */
function k0ObservedOddish() {
  return {
    bench: [{cards: [{name: 'Oddish', fullName: 'Oddish UNB'}],
      getPokemonCard: () => ({name: 'Oddish'})}],
    active: {cards: [{name: 'Bunnelby', fullName: 'Bunnelby PRC'}]},
    hand: {cards: []},
    discard: {cards: []},
    lostzone: {cards: []},
    get deck() {throw new Error('K0 must not read the hidden deck');},
    get prizes() {throw new Error('K0 must not read unknown Prizes');}
  };
}

test('K0 source guard offers potential Evolution regardless of hidden partition', () => {
  const {hasK0PossibleBenchEvolutionTarget} =
    require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
  const source = rank2Source();
  const player = k0ObservedOddish();
  assert.equal(hasK0PossibleBenchEvolutionTarget(player, source), true);
  assert.equal(hasK0PossibleBenchEvolutionTarget(player, [...source]), true);
});

test('K0 source guard removes publicly exhausted stage copies', () => {
  const {hasK0PossibleBenchEvolutionTarget} =
    require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
  const source = rank2Source();
  const player = k0ObservedOddish();
  player.discard.cards.push({fullName: 'Gloom UNB'});
  assert.equal(hasK0PossibleBenchEvolutionTarget(player, source), true);
  player.hand.cards.push({fullName: 'Gloom UNB'});
  assert.equal(hasK0PossibleBenchEvolutionTarget(player, source), false);
  player.hand.cards.pop();
  player.lostzone.cards.push({fullName: 'Gloom UNB'});
  assert.equal(hasK0PossibleBenchEvolutionTarget(player, source), false);
  player.bench.length = 0;
  assert.equal(hasK0PossibleBenchEvolutionTarget(player, source), false);
});
