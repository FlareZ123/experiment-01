'use strict';

const assert = require('node:assert/strict');
const field = require('../results/aichi-2026/full-decklists.json');
const { exactExpandedOpening } = require('../simulation/twinleaf/rank6-expanded-opening-coverage.cjs');

const SOURCE_RANKS = Object.freeze([6, 24, 29]);
const TIER_NAMES = Object.freeze([
  Object.freeze([]),
  Object.freeze(['Tropical Beach', "Trainers' Mail", 'Palace Belt', 'Camping Gear']),
  Object.freeze(["Player's Ceremony", 'Crushing Hammer', 'Enhanced Hammer',
    'Handheld Fan', 'Tool Jammer', 'Echoing Horn', 'Captivating Poké Puff', 'Palace Book']),
  Object.freeze(['Team Flare Grunt', 'Plumeria', "Team Rocket's Handiwork",
    'Team Skull Grunt', 'Sidney', 'Eri', 'Faba']),
  Object.freeze(['Cynthia & Caitlin', 'Guzma', "Lillie's Determination",
    'Lusamine', 'Gladion'])
]);
const CORE_NAMES = Object.freeze([
  'Iron Thorns ex', 'Thunder Mountain ♢', 'Double Colorless Energy',
  'Guzma & Hala', 'Tag Call'
]);

/** @param {object} deck @param {string} name @returns {number} */
function copies(deck, name) {
  return deck.cards.filter(card => card.name === name)
    .reduce((total, card) => total + card.count, 0);
}

/**
 * Build comparable, nested hypothetical discard tiers from each *original*
 * published rank-6/24/29 60, preserving exactly its printed DCE count.
 * @param {number} rank
 * @param {number} tier Integer 0..4
 */
function groupsForRank(rank, tier) {
  assert.ok(SOURCE_RANKS.includes(rank), 'Rank must be a published Iron Thorns placement');
  assert.ok(Number.isInteger(tier) && tier >= 0 && tier <= 4, 'Invalid tier');
  const deck = field.decks.find(row => row.rank === rank);
  assert.ok(deck, 'Published source rank required');
  assert.equal(deck.cards.reduce((sum, card) => sum + card.count, 0), 60);
  assert.equal(deck.cards.filter(card => card.category === 'Pokémon')
    .reduce((sum, card) => sum + card.count, 0), 4);
  const allowed = new Set(TIER_NAMES.slice(0, tier + 1).flat());
  assert.ok(!CORE_NAMES.some(name => allowed.has(name)));
  const groups = {
    thorns: copies(deck, 'Iron Thorns ex'),
    thunder: copies(deck, 'Thunder Mountain ♢'),
    dce: copies(deck, 'Double Colorless Energy'),
    guzmaHala: copies(deck, 'Guzma & Hala'),
    tagCall: copies(deck, 'Tag Call'),
    discards: deck.cards.filter(card => allowed.has(card.name))
      .reduce((sum, card) => sum + card.count, 0)
  };
  assert.equal(groups.thorns, 4);
  assert.equal(groups.thunder, 1);
  assert.equal(groups.guzmaHala, 2);
  assert.equal(groups.tagCall, 2);
  assert.equal(groups.dce, rank === 24 ? 3 : 1);
  groups.other = 60 - Object.values(groups).reduce((sum, value) => sum + value, 0);
  assert.ok(groups.other >= 0);
  return groups;
}

/** @param {{numerator:bigint,denominator:bigint,decimal:number}} value */
function encode(value) {
  return {fraction: String(value.numerator) + '/' + String(value.denominator),
    probability: value.decimal};
}

/** Full-source comparable resource opportunity only; not attack or win rate. */
function crossrankOpening() {
  return {
    schema: 'aichi-thorns-three-rank-expanded-opening-v1',
    source: 'results/aichi-2026/full-decklists.json',
    rankReports: SOURCE_RANKS.map(rank => {
      const tiers = TIER_NAMES.map((names, tier) => {
        const groups = groupsForRank(rank, tier);
        const result = exactExpandedOpening(groups);
        return {tier, newlyAllowedNames: names, permittedDiscardCopies: groups.discards,
          byRoute: {
            direct: encode(result.byRoute.direct),
            guzmaHala: encode(result.byRoute.guzmaHala),
            tagCall: encode(result.byRoute.tagCall)
          }, total: encode(result.total)};
      });
      return {rank, sourcePlayer: field.decks.find(deck => deck.rank === rank).player,
        printedDceCopies: groupsForRank(rank, 0).dce, tiers};
    }),
    qualification: 'Resource opportunity conditional on a valid seven and one normal draw, with six unseen Prizes. Optional opponent mulligan bonuses, actual discard values, real attacks and outcomes excluded.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(crossrankOpening(), null, 2) + '\n');
}
module.exports = { SOURCE_RANKS, TIER_NAMES, CORE_NAMES,
  groupsForRank, crossrankOpening };
