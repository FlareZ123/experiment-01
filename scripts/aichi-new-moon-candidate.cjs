'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {verifyManifest} = require('../simulation/twinleaf/new-moon-lockbreak-validate.cjs');
const base = require('../results/als/new-moon-perfection-english-map.json');
const official = require('../results/als/new-moon-official-japanese-print-60.json');
const proposal = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const setData = require('../resources/sets/en.json');
const root = path.resolve(__dirname, '..');

/** @returns {object} Provisional, source-checked English mechanic proxy. */
function loadNewMoonCandidate() {
  verifyManifest();
  assert.equal(base.source_code, official.source_code);
  assert.equal(base.entries.length, official.entries.length);
  assert.equal(base.entries.length, 33);
  for (let i = 0; i < base.entries.length; i++) {
    assert.equal(base.entries[i].name, official.entries[i].name_en);
    assert.equal(base.entries[i].count, official.entries[i].count);
    assert.ok(Number.isInteger(official.entries[i].japanese_card_id));
  }
  const sets = new Map(setData.map(s => [s.id, s.ptcgoCode]));
  const cache = new Map();
  const resourceFiles = new Map();
  const setDataPath = path.join(root, 'resources', 'sets', 'en.json');
  const setDataRaw = fs.readFileSync(setDataPath, 'utf8');
  resourceFiles.set('resources/sets/en.json',
    createHash('sha256').update(setDataRaw, 'utf8').digest('hex'));
  const substitutions = [];
  const cards = proposal.entries.map(entry => {
    const id = entry.english_proxy_card_id;
    const position = id.indexOf('-');
    assert.ok(position > 0);
    const setId = id.slice(0, position);
    const number = id.slice(position + 1);
    const code = sets.get(setId);
    assert.ok(code, 'Unknown English set ' + setId);
    if (!cache.has(setId)) {
      const cardPath = path.join(root, 'resources', 'cards', 'en', setId + '.json');
      const cardRaw = fs.readFileSync(cardPath, 'utf8');
      const relativeCardPath = path.relative(root, cardPath).split(path.sep).join('/');
      resourceFiles.set(relativeCardPath,
        createHash('sha256').update(cardRaw, 'utf8').digest('hex'));
      cache.set(setId, JSON.parse(cardRaw));
    }
    const found = cache.get(setId).filter(c => c.id === id);
    assert.equal(found.length, 1, 'Unknown English card ' + id);
    assert.equal(found[0].name,
      entry.english_database_name === 'Basic Psychic Energy' ?
        'Psychic Energy' : entry.english_database_name);
    let set = code, printedNumber = number, name = entry.name_en;
    if (id === 'smp-SM217') {
      set = 'SMP'; printedNumber = '217';
      substitutions.push('SM promo notation SMP 217');
    }
    if (id === 'swsh12pt5-156') {
      set = 'MEE'; printedNumber = '13'; name = 'Psychic Energy';
      substitutions.push('CRZ 156 Basic Psychic represented by MEE 13');
    }
    return {category: entry.type, count: entry.count, name,
      printing: {set, number: printedNumber, language: 'en'}};
  });
  assert.equal(cards.reduce((n, x) => n + x.count, 0), 60);
  const resourceDataFiles = [...resourceFiles].map(([filePath, sha256]) => ({
    path: filePath, sha256
  })).sort((a, b) => a.path.localeCompare(b.path, 'en'));
  const resourceDataManifest = {
    schema: 'aichi-new-moon-candidate-resource-data-manifest-v1',
    scope: 'exact resources/sets/en.json and English card-set JSON files read by the candidate loader',
    files: resourceDataFiles,
    fileCount: resourceDataFiles.length,
    cardSetIds: [...cache.keys()].sort((a, b) => a.localeCompare(b, 'en')),
    sha256: createHash('sha256')
      .update(JSON.stringify(resourceDataFiles), 'utf8').digest('hex')
  };
  return {id: 'new-moon-lockbreaker-v1', cards, resourceDataManifest,
    provisionalEnglishProxy: true,
    sourceCode: official.source_code,
    proxyIdCountHash: proposal.canonical_id_count_sha256,
    sourceJapanesePrintsArchived: true,
    paperLegalPrintsVerified: false,
    substitutions};
}
module.exports = {loadNewMoonCandidate};
