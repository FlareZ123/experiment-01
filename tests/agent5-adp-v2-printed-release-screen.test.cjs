'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} file */
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const root = path.resolve(__dirname, '..');
const manifest = readJson(path.join(root, 'results', 'aichi-2026', 'candidates', 'agent5-adp-thorton-regidrago-60-v2.json'));
const setList = readJson(path.join(root, 'resources', 'sets', 'en.json'));
const sets = new Map(setList.map((set) => [set.id, set]));
const cachedCards = new Map();
const cutoff = '2026/05/10';

const cardDigest = crypto.createHash('sha256')
  .update(JSON.stringify(manifest.cards.map(({ count, id, name }) => ({ count, id, name }))), 'utf8')
  .digest('hex');
assert.equal(cardDigest, manifest.canonicalCardsSha256, 'candidate manifest card content changed');
assert.equal(manifest.cards.reduce((total, card) => total + card.count, 0), 60, 'printed deck must be 60');
assert.equal(manifest.cards.length, 27, 'manifest print inventory changed: re-review official crosswalk');

let earliest = '9999/99/99';
let latest = '0000/00/00';
let aceSpecCount = 0;
const nameCounts = new Map();
const distinctSets = new Set();
for (const { id, name, count } of manifest.cards) {
  assert.ok(Number.isInteger(count) && count > 0, `invalid count: ${id}`);
  const split = id.lastIndexOf('-');
  assert.ok(split > 0, `missing set ID: ${id}`);
  const setId = id.slice(0, split);
  const set = sets.get(setId);
  assert.ok(set, `unknown bundled set: ${setId}`);
  assert.equal(set.legalities?.expanded, 'Legal', `set Expanded metadata: ${id}`);
  assert.ok(/^\d{4}\/\d{2}\/\d{2}$/.test(set.releaseDate), `date missing: ${setId}`);
  assert.ok(set.releaseDate <= cutoff, `English set later than Aichi event: ${id}`);
  if (!cachedCards.has(setId)) {
    cachedCards.set(setId, readJson(path.join(root, 'resources', 'cards', 'en', `${setId}.json`)));
  }
  const matches = cachedCards.get(setId).filter((card) => card.id === id);
  assert.equal(matches.length, 1, `printed identity must resolve uniquely: ${id}`);
  const printed = matches[0];
  assert.equal(printed.name, name, `card name mismatch: ${id}`);
  assert.equal(printed.legalities?.expanded, 'Legal', `card Expanded metadata: ${id}`);
  earliest = earliest < set.releaseDate ? earliest : set.releaseDate;
  latest = latest > set.releaseDate ? latest : set.releaseDate;
  distinctSets.add(setId);
  if (printed.subtypes?.includes('ACE SPEC')) aceSpecCount += count;
  if (!(printed.supertype === 'Energy' && printed.subtypes?.includes('Basic'))) {
    nameCounts.set(name, (nameCounts.get(name) ?? 0) + count);
  }
}
for (const [name, count] of nameCounts) {
  assert.ok(count <= 4, `name-level four-copy violation: ${name} (${count})`);
}
assert.equal(aceSpecCount, 1, 'ACE SPEC count changed');
console.log(JSON.stringify({
  test: 'agent5-adp-v2-bundled-english-chronology-and-copy-count',
  status: 'PASS',
  candidateCardsSha256: cardDigest,
  physicalCards: 60,
  printingRows: manifest.cards.length,
  distinctSets: distinctSets.size,
  earliestEnglishSetRelease: earliest,
  latestEnglishSetRelease: latest,
  eventDate: cutoff,
  aceSpecCount,
  scope: 'English set/card metadata only; Japanese event print equivalence and paper-game legality unproven',
}, null, 2));
