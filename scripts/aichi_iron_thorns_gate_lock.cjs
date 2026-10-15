'use strict';
const assert = require('node:assert/strict');
const field = require('../results/aichi-2026/full-decklists.json');
const ironThornsCards = require('../resources/cards/en/sv6.json');
const radiantCards = require('../resources/cards/en/swsh12pt5.json');

/**
 * Audit the champion's Gate line against an opponent beginning the match with
 * active Iron Thorns ex and unsuppressed Initialization.
 * This computes a card-text / source-list conditional constraint only.
 */
function auditIronThornsGate() {
  const champion = field.decks.find(d => d.rank === 1);
  assert.equal(champion.archetype, 'Shadow Rider Calyrex');
  assert.equal(champion.cards.find(c => c.name === 'Radiant Eternatus').count, 1);

  const radiant = radiantCards.find(c => c.id === 'swsh12pt5-105');
  const ironThorns = ironThornsCards.find(c => c.id === 'sv6-77');
  assert.ok(radiant && ironThorns);
  assert.ok(radiant.rules.some(s => s.includes('Radiant Pokémon Rule')));
  assert.ok(!radiant.subtypes.includes('Future'));
  assert.ok(radiant.abilities.some(a => a.name === 'Climactic Gate'));
  const initialization = ironThorns.abilities.find(a => a.name === 'Initialization');
  assert.ok(initialization);
  assert.ok(initialization.text.includes('As long as this Pokémon is in the Active Spot'));
  assert.ok(initialization.text.includes('Pokémon with a Rule Box in play'));
  assert.ok(initialization.text.includes('have no Abilities, except for Future Pokémon'));

  const thorns = field.decks.filter(d => d.archetype === 'Iron Thorns');
  assert.deepEqual(thorns.map(d => d.rank), [6, 24, 29]);
  const standings = thorns.map(deck => {
    const pokemon = deck.cards.filter(c => c.category === 'Pokémon');
    const basicCopies = pokemon.reduce((n, p) => n + p.count, 0);
    assert.deepEqual(pokemon.map(p => p.name), ['Iron Thorns ex']);
    assert.equal(basicCopies, 4);
    return {
      rank: deck.rank, player: deck.player,
      possibleStartingActive: ['Iron Thorns ex'],
      basicCopies,
      gateBlockedWhileInitializationActive: true
    };
  });
  return {
    championRank: 1,
    championRadiantPrinting: 'CRZ 105',
    opposingIronThornsPrinting: 'TWM 77',
    affectedRanks: standings.map(x => x.rank),
    fieldPlacements: field.total_placements,
    observedExactLists: standings,
    inference: 'Climactic Gate is unavailable while an opposing Active Iron Thorns ex has unsuppressed Initialization, because Radiant Eternatus is non-Future Rule Box Pokémon.',
    caution: 'A conditional printed-text restriction only. It does not prove match outcomes or that no card can ever remove or bypass the lock.'
  };
}

if (require.main === module) console.log(JSON.stringify(auditIronThornsGate(), null, 2));
module.exports = {auditIronThornsGate};
