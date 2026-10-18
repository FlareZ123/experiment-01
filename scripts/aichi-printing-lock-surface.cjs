'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** Frozen print-identity targets; attack/Ability semantics come from the card database. */
const FEATURES = Object.freeze({
  garbotoxin: [
    ['Garbodor', 'LTR', '68'],
    ['Garbodor', 'BKP', '57']
  ],
  vileplumeItemLock: [['Vileplume', 'AOR', '3']],
  vileplumeBasicAttackBlock: [['Vileplume', 'BUS', '6']],
  ironThornsInitialization: [['Iron Thorns ex', 'TWM', '77']],
  wobbuffetBideBarricade: [['Wobbuffet', 'PHF', '36']],
  klefkiMischievousLock: [['Klefki', 'SVI', '96']],
  budewItchyPollen: [['Budew', 'ASC', '16']],
  pathToPeak: [['Path to the Peak', 'CRE', '148']],
  fieldBlower: [['Field Blower', 'GRI', '125']],
  lostVacuum: [['Lost Vacuum', 'LOR', '162']],
  pokemonRanger: [['Pokémon Ranger', 'STS', '104']],
  stealthyHood: [['Stealthy Hood', 'UNB', '186']],
  cancelingCologne: [['Canceling Cologne', 'ASR', '136']],
  escapeRope: [['Escape Rope', 'BST', '125']]
});

/**
 * Each group is a search-surface definition, not an assertion that every
 * listed card is playable, activated, or tactically good in a particular game.
 */
const GROUPS = Object.freeze({
  itemPressurePrinted: ['vileplumeItemLock', 'budewItchyPollen'],
  persistentBoardConstraintsPrinted: [
    'garbotoxin', 'vileplumeBasicAttackBlock',
    'ironThornsInitialization', 'wobbuffetBideBarricade',
    'klefkiMischievousLock', 'pathToPeak'
  ],
  anySelectedConstraintPrinted: [
    'vileplumeItemLock', 'budewItchyPollen',
    'garbotoxin', 'vileplumeBasicAttackBlock',
    'ironThornsInitialization', 'wobbuffetBideBarricade',
    'klefkiMischievousLock', 'pathToPeak'
  ],
  printedItemToolRemoval: ['fieldBlower', 'lostVacuum']
});

/**
 * @param {{cards:{name:string,count:number,printing:{set:string,number:string}}[]}} deck
 * @param {readonly (readonly [string,string,string])[]} targets
 * @returns {number} Printed physical card copies matching this exact target.
 */
function countPrintings(deck, targets) {
  return deck.cards.reduce((sum, card) => sum + (
    targets.some(([name, set, number]) =>
      card.name === name &&
      card.printing.set === set &&
      String(card.printing.number) === number) ? card.count : 0
  ), 0);
}

/**
 * @param {object} source Original published 29-of-32 JSON inventory.
 * @returns {object} Reproducible print-aware source ledger, never matchup evidence.
 */
function analyse(source) {
  assert.equal(source.total_placements, 32);
  assert.equal(source.published_deck_count, source.decks.length);
  const ranks = new Set();
  const rows = source.decks.map(deck => {
    assert.ok(Number.isInteger(deck.rank) && deck.rank >= 1 && deck.rank <= 32);
    assert.ok(!ranks.has(deck.rank), 'Repeated published placement');
    ranks.add(deck.rank);
    assert.equal(deck.cards.reduce((sum, card) => sum + card.count, 0), 60);
    const counts = Object.fromEntries(Object.entries(FEATURES).map(
      ([feature, targets]) => [feature, countPrintings(deck, targets)]
    ));
    const groups = Object.fromEntries(Object.entries(GROUPS).map(
      ([group, ids]) => [group, ids.some(id => counts[id] > 0)]
    ));
    return {
      rank: deck.rank, archetype: deck.archetype,
      counts, groups
    };
  }).sort((a, b) => a.rank - b.rank);
  const missing = source.missing_full_lists.map(row => row.rank).sort((a, b) => a - b);
  assert.equal(rows.length + missing.length, 32);
  assert.ok(missing.every(rank => !ranks.has(rank)));
  const features = Object.fromEntries(Object.keys(FEATURES).map(id => {
    const covered = rows.filter(row => row.counts[id] > 0);
    return [id, {
      listedDecks: covered.length,
      physicalCopies: covered.reduce((sum, row) => sum + row.counts[id], 0),
      ranks: covered.map(row => row.rank)
    }];
  }));
  const groups = Object.fromEntries(Object.keys(GROUPS).map(id => {
    const covered = rows.filter(row => row.groups[id]);
    return [id, {listedDecks: covered.length, ranks: covered.map(row => row.rank)}];
  }));
  return {
    schema: 'aichi-source-print-aware-lock-surface-v1',
    coverage: rows.length, fieldTotal: 32, missingRanks: missing,
    features, groups, rows,
    caveat: 'Printed inventory only: availability, legality, Bench/Active occupancy, costs, lock conflicts, tactical response, strength and win rate are untested.'
  };
}

if (require.main === module) {
  const sourceFile = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const bytes = fs.readFileSync(sourceFile);
  const data = analyse(JSON.parse(bytes.toString('utf8')));
  process.stdout.write(JSON.stringify({
    sourceSha256: createHash('sha256').update(bytes).digest('hex'),
    ...data
  }, null, 2) + '\n');
}

module.exports = {FEATURES, GROUPS, countPrintings, analyse};
