'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../results/aichi-2026/full-decklists.json');
const {hasBenchEvolutionTarget} =
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');

/** @param {boolean} targetPrized */
function sourcePartition(targetPrized) {
  const rank2 = source.decks.find(deck => deck.rank === 2);
  assert.ok(rank2);
  const stock = rank2.cards.flatMap(row => Array.from({length: row.count},
    () => ({name:row.name, fullName:row.name + ' ' + row.printing.set,
      ...(row.name === 'Vileplume' || row.name === 'Vileplume-GX' ?
        {evolvesFrom: 'Gloom', stage: 2} : {})})));
  assert.equal(stock.length, 60);
  /** @param {string} name */
  const take = name => {
    const i = stock.findIndex(card => card.name === name);
    assert.ok(i >= 0, 'Absent rank-2 source printing: ' + name);
    return stock.splice(i, 1)[0];
  };
  const active = take('Bunnelby');
  const oddish = take('Oddish');
  const gloom = take('Gloom');
  const hand = ['Vileplume', 'Vileplume-GX', 'Cassius', 'Tag Call',
    'Guzma & Hala', 'Jet Energy', 'Stealthy Hood'].map(take);
  const remainingTarget = take('Vileplume');
  const neutralPrizes = stock.splice(0, 6);
  assert.ok(neutralPrizes.every(card => card.name !== 'Vileplume'));
  const prizeSwap = neutralPrizes[0];
  const prizes = targetPrized ?
    [remainingTarget, ...neutralPrizes.slice(1)] : neutralPrizes;
  stock.push(targetPrized ? prizeSwap : remainingTarget);
  assert.equal(1 + 2 + hand.length + prizes.length + stock.length, 60);
  const player = {
    active: {getPokemonCard: () => active},
    bench: [{cards: [oddish, gloom], getPokemonCard: () => gloom}],
    hand: {cards: hand},
    prizes: prizes.map(card => ({cards:[card]})),
    deck: {cards: stock}
  };
  return player;
}

test('published rank-2 60-card source K0 partition toggles omniscient tactic gate', () => {
  const inDeck = sourcePartition(false);
  const inPrizes = sourcePartition(true);
  assert.deepEqual(inDeck.hand.cards, inPrizes.hand.cards);
  assert.deepEqual(inDeck.active.getPokemonCard(), inPrizes.active.getPokemonCard());
  assert.deepEqual(inDeck.bench[0].cards, inPrizes.bench[0].cards);
  assert.equal(inDeck.prizes.length, 6);
  assert.equal(inPrizes.prizes.length, 6);
  assert.equal(inDeck.deck.cards.length, inPrizes.deck.cards.length);
  assert.equal(hasBenchEvolutionTarget(inDeck), true);
  assert.equal(hasBenchEvolutionTarget(inPrizes), false);
  const count = player => [
    player.active.getPokemonCard(), ...player.bench[0].cards, ...player.hand.cards,
    ...player.prizes.flatMap(prize => prize.cards), ...player.deck.cards
  ].reduce((acc, card) => {
    const key = card.fullName;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  // Stage 2 on a Basic conserves both physical evolution cards.
  assert.deepEqual(count(inDeck), count(inPrizes));
});
