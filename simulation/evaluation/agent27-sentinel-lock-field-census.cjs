'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SOURCE = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
const EXPECTED_MISSING = [23, 25, 28];
const NAMES = [
  'Garbodor',
  'Tool Jammer',
  'Lysandre Labs',
  'Field Blower',
  'Faba',
  'Megaton Blower',
  'Lost Vacuum',
  'Temple of Sinnoh',
  'Silent Lab',
  'Path to the Peak',
  'Power Plant',
  'Guzma',
  'Escape Rope'
];

function countName(deck, name) {
  return (deck.cards || [])
    .filter(card => card.name === name)
    .reduce((sum, card) => sum + card.count, 0);
}

function summarize(decks, name) {
  const matches = decks
    .map(deck => ({ rank: deck.rank, count: countName(deck, name) }))
    .filter(row => row.count > 0);
  return {
    ranks: matches.map(row => row.rank),
    listCount: matches.length,
    copies: matches.reduce((sum, row) => sum + row.count, 0)
  };
}

function cooccurs(decks, a, b) {
  return decks
    .filter(deck => countName(deck, a) > 0 && countName(deck, b) > 0)
    .map(deck => deck.rank);
}

function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const decks = source.decks;
  if (!Array.isArray(decks) || decks.length !== 29) {
    throw new Error(`Expected 29 authenticated source lists; found ${decks?.length}`);
  }
  const missing = (source.missing_full_lists || []).map(row => row.rank).sort((a,b)=>a-b);
  if (JSON.stringify(missing) !== JSON.stringify(EXPECTED_MISSING)) {
    throw new Error(`Unexpected missing-rank set: ${JSON.stringify(missing)}`);
  }

  const cards = Object.fromEntries(NAMES.map(name => [name, summarize(decks, name)]));
  const cooccurrencePairs = [
    ['Garbodor', 'Tool Jammer'],
    ['Garbodor', 'Lysandre Labs'],
    ['Garbodor', 'Field Blower'],
    ['Garbodor', 'Faba'],
    ['Garbodor', 'Megaton Blower'],
    ['Garbodor', 'Lost Vacuum'],
    ['Garbodor', 'Path to the Peak'],
    ['Garbodor', 'Silent Lab']
  ];
  const cooccurrence = Object.fromEntries(cooccurrencePairs.map(([a,b]) =>
    [`${a} + ${b}`, cooccurs(decks, a, b)]));

  const result = {
    schema: 'agent27-aichi-sentinel-lock-field-census-v1',
    source: 'results/aichi-2026/full-decklists.json',
    knownDeckCount: decks.length,
    missingRanks: missing,
    cards,
    cooccurrence,
    interpretation: {
      garbodorRanks: cards.Garbodor.ranks,
      toolJammerRanks: cards['Tool Jammer'].ranks,
      garbodorToolJammerCooccurrence: cooccurrence['Garbodor + Tool Jammer'],
      lysandreLabsRanks: cards['Lysandre Labs'].ranks,
      limitation: 'Exact-name printed-list presence only; not access, timing, legal-play probability, matchup performance, or game outcomes.'
    }
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

if (require.main === module) main();

module.exports = { countName, summarize, cooccurs };
