'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {string} */
function normalizeName(name) {
  return name.replaceAll('♢', '◇');
}

/**
 * Construct a card-name -> Basic status index from the English snapshot.
 * Ambiguous names are marked null, then rejected if used by the benchmark.
 * @param {string} directory
 * @returns {Map<string, boolean | null>}
 */
function loadBasicIndex(directory) {
  const index = new Map();
  for (const file of fs.readdirSync(directory).sort()) {
    if (!file.endsWith('.json')) continue;
    for (const card of JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'))) {
      if (card.supertype !== 'Pokémon') continue;
      const name = normalizeName(card.name);
      const basic = card.subtypes.includes('Basic');
      if (index.has(name) && index.get(name) !== basic) index.set(name, null);
      else if (!index.has(name)) index.set(name, basic);
    }
  }
  return index;
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
  return Math.round(result);
}

/** @param {number} basics @returns {number} */
function mulliganProbability(basics) {
  if (!Number.isInteger(basics) || basics < 1 || basics > 60) {
    throw new RangeError('Invalid number of Basic Pokémon: ' + basics);
  }
  return choose(60 - basics, 7) / choose(60, 7);
}

/**
 * Expected number of optional draw opportunities B receives from A's
 * mulligans, accounting for the possibility both mulligan together.
 * Does not assume B chooses to take any offered cards.
 * @param {number} pA
 * @param {number} pB
 * @returns {number}
 */
function opponentDrawOpportunities(pA, pB) {
  return pA * (1 - pB) / ((1 - pA) * (1 - pA * pB));
}

/**
 * Validate the 60-card lists, counts, name-limit, and Pokémon stages.
 * @param {Array<{rank:number, archetype:string, cards:Array<{name:string,category:string,count:number}>, category_counts:Record<string,number>}>} decks
 * @param {Map<string, boolean | null>} basicIndex
 */
function audit(decks, basicIndex) {
  const ranks = new Set();
  const basicEnergy = new Set([
    'Grass Energy', 'Fire Energy', 'Water Energy', 'Lightning Energy',
    'Psychic Energy', 'Fighting Energy', 'Darkness Energy', 'Metal Energy', 'Fairy Energy',
  ]);
  return decks.map((deck) => {
    if (ranks.has(deck.rank)) throw new Error('Duplicate rank ' + deck.rank);
    ranks.add(deck.rank);
    const total = deck.cards.reduce((sum, c) => sum + c.count, 0);
    if (total !== 60) throw new Error('Rank ' + deck.rank + ' contains ' + total + ' cards');
    const quantity = new Map();
    for (const card of deck.cards) {
      if (!Number.isInteger(card.count) || card.count < 1) {
        throw new Error('Rank ' + deck.rank + ' contains an invalid card count');
      }
      const name = normalizeName(card.name);
      quantity.set(name, (quantity.get(name) || 0) + card.count);
    }
    for (const [name, count] of quantity) {
      if (count > 4 && !basicEnergy.has(name)) {
        throw new Error('Rank ' + deck.rank + ' contains ' + count + ' copies of ' + name);
      }
    }
    for (const [category, expected] of Object.entries(deck.category_counts)) {
      const actual = deck.cards.filter((c) => c.category === category)
        .reduce((sum, c) => sum + c.count, 0);
      if (actual !== expected) throw new Error('Rank ' + deck.rank + ' category mismatch: ' + category);
    }
    let basics = 0;
    for (const card of deck.cards.filter((c) => c.category === 'Pokémon')) {
      const name = normalizeName(card.name);
      const isBasic = basicIndex.get(name);
      if (typeof isBasic !== 'boolean') {
        throw new Error('Rank ' + deck.rank + ' Pokémon has unknown or ambiguous stage: ' + name);
      }
      if (isBasic) basics += card.count;
    }
    const p = mulliganProbability(basics);
    return {
      rank: deck.rank,
      archetype: deck.archetype,
      basicCount: basics,
      mulliganProbability: p,
      expectedMulligans: p / (1 - p),
    };
  }).sort((a, b) => a.rank - b.rank);
}

/** @param {ReturnType<typeof audit>} rows @param {number} referenceRank @returns {string} */
function toMarkdown(rows, referenceRank = 1) {
  const ref = rows.find((row) => row.rank === referenceRank);
  if (!ref) throw new Error('Missing reference rank ' + referenceRank);
  const out = [
    '# Aichi 2026 opening-hand audit',
    '',
    'Reference opponent: rank ' + referenceRank + ' (' + ref.archetype + '), ' + ref.basicCount + ' Basic Pokémon.',
    '',
    '| Rank | Archetype | Basics | Initial mulligan | Expected own mulligans | Optional draw opportunities for reference opponent |',
    '| ---: | --- | ---: | ---: | ---: | ---: |',
  ];
  for (const row of rows) {
    out.push('| ' + row.rank + ' | ' + row.archetype + ' | ' + row.basicCount
      + ' | ' + (row.mulliganProbability * 100).toFixed(3) + '% | '
      + row.expectedMulligans.toFixed(3) + ' | '
      + opponentDrawOpportunities(row.mulliganProbability, ref.mulliganProbability).toFixed(3) + ' |');
  }
  return out.join('\n');
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const index = loadBasicIndex(path.join(root, 'resources/cards/en'));
  process.stdout.write(toMarkdown(audit(data.decks, index)) + '\n');
}

module.exports = {
  normalizeName, loadBasicIndex, choose, mulliganProbability,
  opponentDrawOpportunities, audit, toMarkdown,
};
