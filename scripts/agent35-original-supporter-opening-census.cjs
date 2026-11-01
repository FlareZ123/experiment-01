'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = 'results/aichi-2026/full-decklists.json';
const CATALOG_DIRECTORY = 'resources/cards/en';

/** @param {string} name @returns {string} */
function normalizeName(name) {
  return name.normalize('NFKC').replace(/♢/g, '◇');
}

/**
 * Construct a name-keyed card-classification index from the actual local
 * source database. Different reprints must agree for categories examined.
 * @param {string} directory
 * @returns {Map<string, {supertype:string, basic:boolean, supporter:boolean}>}
 */
function buildClassificationIndex(directory) {
  const index = new Map();
  for (const file of fs.readdirSync(directory).filter(f => f.endsWith('.json')).sort()) {
    const records = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    assert.ok(Array.isArray(records), file);
    for (const card of records) {
      if (card.supertype !== 'Pokémon' && card.supertype !== 'Trainer') continue;
      const key = card.supertype + ':' + normalizeName(card.name);
      const entry = {
        supertype: card.supertype,
        basic: card.supertype === 'Pokémon' && card.subtypes.includes('Basic'),
        supporter: card.supertype === 'Trainer' && card.subtypes.includes('Supporter')
      };
      const previous = index.get(key);
      if (previous) {
        assert.deepEqual(entry, previous, 'Conflicting stage or Trainer class: ' + key);
      } else {
        index.set(key, entry);
      }
    }
  }
  return index;
}

/**
 * Exact probability that n draws from N cards miss a named set of k cards.
 * @param {number} N @param {number} k @param {number} n
 * @returns {number}
 */
function missProbability(N, k, n) {
  assert.ok([N, k, n].every(Number.isSafeInteger));
  assert.ok(N > 0 && k >= 0 && n >= 0 && k <= N && n <= N);
  let p = 1;
  for (let i = 0; i < n; i += 1) p *= (N - k - i) / (N - i);
  return p;
}

/**
 * Supporter visibility on the first valid 7-card hand after any mulligans.
 * Basic Pokemon and Supporters are disjoint printed-card classes.
 * Does not model opponent bonus draws, search, Supporter legality or use.
 * @param {number} basic @param {number} supporter
 * @returns {{basicValid:number, supporterUnconditional:number, supporterGivenBasic:number}}
 */
function openingEnvelope(basic, supporter) {
  assert.ok(Number.isSafeInteger(basic) && basic >= 1);
  assert.ok(Number.isSafeInteger(supporter) && supporter >= 0);
  assert.ok(basic + supporter <= 60);
  const basicValid = 1 - missProbability(60, basic, 7);
  const supporterUnconditional = 1 - missProbability(60, supporter, 7);
  const joint = 1 - missProbability(60, basic, 7)
    - missProbability(60, supporter, 7)
    + missProbability(60, basic + supporter, 7);
  return {basicValid, supporterUnconditional, supporterGivenBasic: joint / basicValid};
}

/**
 * @param {object} roster Parsed published original list corpus.
 * @param {Map<string, object>} index Card classification index.
 * @returns {object[]}
 */
function census(roster, index) {
  assert.equal(roster.published_deck_count, 29);
  assert.equal(roster.decks.length, 29);
  return roster.decks.map(deck => {
    assert.equal(deck.cards.reduce((sum, card) => sum + card.count, 0), 60);
    let basic = 0, supporter = 0;
    for (const card of deck.cards) {
      const key = card.category + ':' + normalizeName(card.name);
      const info = index.get(key);
      // Missing or ambiguous catalog printing identities must fail loudly.
      assert.ok(info, 'Missing printed classification: ' + key + ' rank ' + deck.rank);
      if (info.basic) basic += card.count;
      if (info.supporter) supporter += card.count;
    }
    const guzma = deck.cards
      .filter(card => card.category === 'Trainer' && card.name === 'Guzma')
      .reduce((sum, card) => sum + card.count, 0);
    return {rank: deck.rank, archetype: deck.archetype,
      basic, supporter, guzma, ...openingEnvelope(basic, supporter)};
  });
}

function run() {
  const sourceBytes = fs.readFileSync(path.join(ROOT, SOURCE));
  const roster = JSON.parse(sourceBytes.toString('utf8'));
  const index = buildClassificationIndex(path.join(ROOT, CATALOG_DIRECTORY));
  const rows = census(roster, index);
  const meanValid = rows.reduce((sum, row) => sum + row.supporterGivenBasic, 0) / rows.length;
  return {
    schema: 'agent35-original-supporter-opening-envelope-v1',
    source: SOURCE,
    sourceSha256: createHash('sha256').update(sourceBytes).digest('hex'),
    exactOriginals: rows.length,
    missingRanks: roster.missing_full_lists.map(x => x.rank),
    openingModel: 'uniform seven-card hand conditioned on at least one Basic; no bonus draws or play decisions',
    meanValid, rows
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + '\n');

module.exports = {normalizeName, buildClassificationIndex, missProbability,
  openingEnvelope, census, run};
