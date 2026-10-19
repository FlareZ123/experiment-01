'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Make a 60-card multiset; duplicate name/printing rows are summed.
 * Printed IDs distinguish mechanically different same-name Pokemon.
 * @param {{cards:Array<{name:string,count:number,printing?:{set:string,number:string|number,language?:string}}>}} deck
 * @param {'name'|'print'} mode
 * @returns {Map<string, number>}
 */
function inventory(deck, mode) {
  if (!['name', 'print'].includes(mode) || !Array.isArray(deck?.cards)) {
    throw new Error('Invalid deck or identity mode');
  }
  const counts = new Map();
  let total = 0;
  for (const card of deck.cards) {
    if (typeof card?.name !== 'string' || !card.name.trim() ||
        !Number.isInteger(card.count) || card.count <= 0) {
      throw new Error('Invalid card row');
    }
    let key = card.name.trim();
    if (mode === 'print') {
      if (!card.printing?.set || card.printing.number === undefined) {
        throw new Error('Missing source printing');
      }
      key = JSON.stringify([key, String(card.printing.set).toUpperCase(),
        String(card.printing.number), card.printing.language || '']);
    }
    counts.set(key, (counts.get(key) || 0) + card.count);
    total += card.count;
  }
  if (total !== 60) throw new Error('Expected exactly 60 cards');
  return counts;
}

/**
 * Minimum unit card replacements transforming one 60-card multiset to another.
 * A printing-sensitive replacement may have no mechanical effect for a reprint.
 * @param {Map<string,number>} a
 * @param {Map<string,number>} b
 * @returns {number}
 */
function swaps(a, b) {
  let common = 0;
  for (const [key, count] of a) common += Math.min(count, b.get(key) || 0);
  return 60 - common;
}

/**
 * Exact discrete k-center under card-replacement distance. Centers must be
 * published source ranks from the same archetype. All optimal solutions tied
 * at the minimum worst uncovered distance are counted.
 * @param {Array<{rank:number,inv:Map<string,number>}>} rows
 * @param {number} k
 * @returns {{radius:number,ranks:number[],optimalSets:number}}
 */
function centers(rows, k) {
  if (!Number.isInteger(k) || k < 1 || k > rows.length) {
    throw new Error('Invalid center count');
  }
  const distances = rows.map(a => rows.map(b => swaps(a.inv, b.inv)));
  let radius = Infinity;
  let optimalSets = 0;
  let ranks = [];
  function visit(selected, next) {
    if (selected.length === k) {
      const worst = Math.max(...distances.map(row =>
        Math.min(...selected.map(center => row[center]))));
      if (worst < radius) {
        radius = worst;
        optimalSets = 0;
      }
      if (worst === radius) {
        if (optimalSets === 0) ranks = selected.map(i => rows[i].rank);
        optimalSets++;
      }
      return;
    }
    for (let i = next; i <= rows.length - (k - selected.length); i++) {
      visit([...selected, i], i + 1);
    }
  }
  visit([], 0);
  return {radius, ranks, optimalSets};
}

/**
 * Descriptive coverage only. Distance is not a matchup performance bound.
 * @param {{decks:Array<{rank:number,archetype:string,cards:Array<object>}>}} source
 * @returns {object}
 */
function analyze(source) {
  if (!Array.isArray(source?.decks)) throw new Error('Missing source decks');
  const groups = new Map();
  const known = new Set();
  for (const deck of source.decks) {
    if (!Number.isInteger(deck.rank) || deck.rank < 1 || deck.rank > 32 ||
        known.has(deck.rank) || !deck.archetype) throw new Error('Invalid source rank');
    known.add(deck.rank);
    const row = {rank:deck.rank,
      name:inventory(deck, 'name'), print:inventory(deck, 'print')};
    if (!groups.has(deck.archetype)) groups.set(deck.archetype, []);
    groups.get(deck.archetype).push(row);
  }
  const archetypes = {};
  for (const [archetype, group] of groups) {
    group.sort((a,b) => a.rank - b.rank);
    if (group.length < 2) continue;
    const pairs = [];
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        pairs.push({ranks:[group[i].rank,group[j].rank],
          nameSwaps:swaps(group[i].name,group[j].name),
          printSwaps:swaps(group[i].print,group[j].print)});
      }
    }
    const byPrint = pairs.slice().sort((a,b) =>
      a.printSwaps-b.printSwaps || a.ranks[0]-b.ranks[0] || a.ranks[1]-b.ranks[1]);
    const byName = pairs.slice().sort((a,b) =>
      a.nameSwaps-b.nameSwaps || a.ranks[0]-b.ranks[0] || a.ranks[1]-b.ranks[1]);
    archetypes[archetype] = {
      ranks:group.map(x=>x.rank), pairs:pairs.length,
      printClosest:byPrint[0], printFarthest:byPrint[byPrint.length-1],
      nameClosest:byName[0], nameFarthest:byName[byName.length-1],
      printCenters:Array.from({length:Math.min(4,group.length)},(_,k) =>
        ({k:k+1,...centers(group.map(x=>({rank:x.rank,inv:x.print})),k+1)}))
    };
  }
  return {publishedRanks:[...known].sort((a,b)=>a-b),
    missingRanks:Array.from({length:32},(_,i)=>i+1).filter(r=>!known.has(r)),
    archetypes};
}

if (require.main === module) {
  const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  process.stdout.write(JSON.stringify(analyze(source),null,2)+'\n');
}

module.exports = {inventory, swaps, centers, analyze};
