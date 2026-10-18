'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');

/**
 * Compute name-level *deck incidence* without counting different printings in
 * one deck twice. Keep printing-level records separate: identical names can
 * have different attacks or Abilities.
 * @param {{decks:Array<{rank:number,cards:Array<{name:string,count:number,category:string,printing?:{set?:string,number?:string,language?:string}}>}>,missing_full_lists?:Array<{rank:number}>}} field
 * @returns {{availableDecks:number,missingRanks:number[],nameIncidence:Array<{name:string,decks:number,copies:number,ranks:number[]}>,mixedPrintingNames:Array<{rank:number,name:string,copies:number,printings:Array<{id:string,copies:number}>}>}}
 */
function analyzeIncidence(field) {
  assert.ok(Array.isArray(field.decks), 'Source must contain decks');
  const names = new Map();
  const mixedPrintingNames = [];
  const seenRanks = new Set();

  for (const deck of field.decks) {
    assert.ok(Number.isInteger(deck.rank) && !seenRanks.has(deck.rank),
      'Ranks must be distinct integers');
    seenRanks.add(deck.rank);
    const local = new Map();
    let deckSize = 0;
    for (const card of deck.cards) {
      assert.ok(typeof card.name === 'string' && card.name.length > 0);
      assert.ok(Number.isInteger(card.count) && card.count > 0);
      deckSize += card.count;
      if (!local.has(card.name)) local.set(card.name, []);
      local.get(card.name).push(card);
    }
    assert.equal(deckSize, 60, 'Aichi rank ' + deck.rank + ' is not 60 cards');

    for (const [name, entries] of local) {
      const copies = entries.reduce((sum, entry) => sum + entry.count, 0);
      const summary = names.get(name) || {
        name, decks: 0, copies: 0, ranks: []
      };
      summary.decks += 1;
      summary.copies += copies;
      summary.ranks.push(deck.rank);
      names.set(name, summary);

      if (entries.length > 1) {
        mixedPrintingNames.push({
          rank: deck.rank,
          name,
          copies,
          printings: entries.map(entry => ({
            id: [entry.printing?.set ?? '?', entry.printing?.number ?? '?',
              entry.printing?.language ?? '?'].join('/'),
            copies: entry.count
          }))
        });
      }
    }
  }

  const nameIncidence = [...names.values()].map(row => ({
    ...row, ranks: row.ranks.sort((a, b) => a - b)
  })).sort((a, b) => b.decks - a.decks ||
      b.copies - a.copies || a.name.localeCompare(b.name));
  mixedPrintingNames.sort((a, b) => a.rank - b.rank ||
    a.name.localeCompare(b.name));
  return {
    availableDecks: field.decks.length,
    missingRanks: (field.missing_full_lists ?? []).map(x => x.rank)
      .sort((a, b) => a - b),
    nameIncidence,
    mixedPrintingNames
  };
}

function main() {
  const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const report = analyzeIncidence(data);
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (require.main === module) main();
module.exports = { analyzeIncidence, main };
