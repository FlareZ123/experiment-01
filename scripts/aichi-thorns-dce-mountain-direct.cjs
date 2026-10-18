'use strict';

const assert = require('node:assert/strict');
const {jointDirect} = require('./new-moon-thorns-starter-joint.cjs');
const field = require('../results/aichi-2026/full-decklists.json');

/**
 * Direct opening visibility of one DCE and Thunder Mountain, conditional on
 * a legal seven-card opener. This is strictly card visibility by eight,
 * without Trainer access, opponent mulligan bonuses or legal game actions.
 */
function audit() {
  const ranks = [6, 24, 29];
  const rows = ranks.map(rank => {
    const deck = field.decks.find(d => d.rank === rank);
    assert.ok(deck);
    const copies = name => deck.cards.filter(c => c.name === name)
      .reduce((total, c) => total + c.count, 0);
    const basics = deck.cards.filter(c => c.category === 'Pokémon')
      .reduce((total, c) => total + c.count, 0);
    const dce = copies('Double Colorless Energy');
    const mountain = copies('Thunder Mountain ♢');
    assert.equal(basics, 4);
    assert.equal(copies('Iron Thorns ex'), 4);
    assert.equal(mountain, 1);
    assert.ok(dce >= 1);
    return {
      rank,
      basics,
      doubleColorlessEnergy: dce,
      thunderMountain: mountain,
      directJointByFirstDraw: jointDirect({
        size: 60, hand: 7, basics, starters: 4,
        groups: [dce, mountain], later: 1
      })
    };
  });
  return {
    schema: 'aichi-thorns-dce-mountain-direct-eight-v1',
    benchmark: 'Aichi 2026 exact ranks 6, 24 and 29',
    conditioning: 'At least one Iron Thorns ex among first seven; first draw is the eighth observed physical card',
    exclusions: 'No Trainer searches, prior mulligan bonus draws, card play/order feasibility, disruption, opponent policy or game results',
    rows,
    qualifiedForCompetitiveInference: false
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(audit(), null, 2) + '\n');
module.exports = {audit};
