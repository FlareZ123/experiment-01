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
