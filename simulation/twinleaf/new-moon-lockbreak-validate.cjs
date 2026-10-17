'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const path = require('node:path');
const base = require('../../results/als/new-moon-perfection-english-map.json');
const originalPrints = base;
const proposal = require('../../results/als/new-moon-lockbreak-english-proxy-60.json');
const banSnapshot = require('../../results/legality/japan-expanded-aichi-2026.json');

/** @param {{english_proxy_card_id:string,count:number}[]} entries */
function idCountHash(entries) {
  const lines = entries.map(x => [x.english_proxy_card_id, x.count]);
  lines.sort((a, b) => a[0].localeCompare(b[0], 'en'));
  return createHash('sha256')
    .update(lines.map(([id, count]) => id + ':' + count + '\n').join(''), 'utf8')
    .digest('hex');
}

/** Pure count, id and category assertions, with no engine dependency. */
function verifyManifest() {
  assert.equal(base.entries.length, 33);
  assert.equal(proposal.entries.length, 34);
  assert.equal(base.entries.reduce((n, row) => n + row.count, 0), 60);
  assert.equal(proposal.entries.reduce((n, row) => n + row.count, 0), 60);
  assert.equal(idCountHash(base.entries.map(row => ({english_proxy_card_id: row.id, count: row.count}))), base.sha256_id_counts);
  assert.equal(idCountHash(proposal.entries), proposal.canonical_id_count_sha256);
  assert.equal(proposal.source_id_count_sha256, base.sha256_id_counts);
  const source = new Map(base.entries.map(row => [row.id, row]));
  const actualDiff = {};
  for (const row of base.entries) actualDiff[row.id] = -row.count;
  for (const row of proposal.entries) {
    assert.ok(row.count >= 1 && row.count <= 4, 'Invalid physical multiplicity');
    assert.ok(!banSnapshot.banned_identities.some(b => b.selector.type === 'trainer_name' &&
      b.english_name === row.name_en), 'Banned Trainer in candidate: ' + row.name_en);
    actualDiff[row.english_proxy_card_id] =
      (actualDiff[row.english_proxy_card_id] || 0) + row.count;
    if (source.has(row.english_proxy_card_id)) {
      assert.equal(row.name_en,
        source.get(row.english_proxy_card_id).name,
        'Original mechanical printing changed under same ID');
    }
  }
  const changes = Object.fromEntries(Object.entries(actualDiff).filter(([, n]) => n !== 0));
  assert.deepEqual(changes, {
    'swsh7-154': -2, 'xy6-92': -2, 'sm2-125': 2, 'swsh10-136': 2
  });
  const counts = Object.fromEntries(['Pokémon', 'Trainer', 'Energy'].map(type =>
    [type, proposal.entries.filter(row => row.type === type)
      .reduce((n, row) => n + row.count, 0)]));
  assert.deepEqual(counts, {'Pokémon': 19, Trainer: 35, Energy: 6});
  return {changes, counts, hash: proposal.canonical_id_count_sha256};
}

/** Compiled pinned-engine mechanical and deck-rule acceptance. */
function validate() {
  const manifest = verifyManifest();
  const {initializeCards} = require('./headless.cjs');
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const {DeckAnalyser} = require(path.join(output, 'game/cards/deck-analyser'));
  const {Format} = require(path.join(output, 'game/store/card/card-types'));
  const manager = initializeCards();
  const originalById = new Map(originalPrints.entries.map(row => [row.id, row]));
  const cards = [];
  const expandedIds = [];
  for (const row of proposal.entries) {
    const print = originalById.get(row.english_proxy_card_id);
    const fullName = print?.twinleaf_full_name ?? row.twinleaf_full_name;
    assert.ok(fullName, 'No explicit engine alias: ' + row.name_en);
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'Pinned engine lacks printing: ' + fullName);
    assert.equal(card.fullName, fullName);
    if (print?.signature) {
      assert.ok([...(card.powers || []).map(x => x.name), ...(card.attacks || []).map(x => x.name)]
        .includes(print.signature), 'Wrong mechanics: ' + row.name_en);
    }
    for (let n = 0; n < row.count; n++) expandedIds.push(card.fullName);
    cards.push({card: row.name_en, fullName, count: row.count});
  }
  assert.equal(expandedIds.length, 60);
  assert.equal(new DeckAnalyser(expandedIds).isValid(Format.EXPANDED), true,
    'Rejected by pinned engine Expanded validator');
  return {schema: 'new-moon-lockbreak-engine-audit-v1',
    sourceCode: originalPrints.source_code, eventDate: '2026-05-10',
    twinleafPin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    simulatorExpandedValid: true, japanesePaperPrintingVerified: false,
    qualifiedForCompetitiveInference: false,
    ...manifest, cards};
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(validate(), null, 2) + '\n');
}
module.exports = {verifyManifest, validate};
