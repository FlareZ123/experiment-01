'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {audit, auditFromResources} =
  require('../scripts/aichi-champion-jp-audit.cjs');

const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const source = load('results/aichi-2026/official-champion-japanese-print-60.json');
const field = load('results/aichi-2026/full-decklists.json');
const bans = load('results/legality/japan-expanded-aichi-2026.json');
const copy = value => JSON.parse(JSON.stringify(value));

test('archived official Japanese champion 60 matches 29-list rank1 exactly', () => {
  const result = auditFromResources();
  assert.equal(result.bilingualNameCountCategoryMatch, true);
  assert.equal(result.datedNamedBanCollision, false);
  assert.equal(result.sourceRows, 33);
  assert.equal(result.sourceCopies, 60);
  assert.deepEqual(result.sameNameBanContacts.map(row => row.englishName),
    ['Marshadow']);
  assert.equal(result.completeJapanesePaperLegalityVerified, false);
  assert.equal(result.qualifiedCompetitiveGameCount, 0);
});

test('refuses an official bilingual quantity drift', () => {
  const wrong = copy(source);
  wrong.entries.find(row => row.name_en === 'Mimikyu').count++;
  assert.throws(() => audit(wrong, field, bans),
    /Published English inventory/);
});

test('refuses a forbidden name or named printing', () => {
  const wrongName = copy(source);
  wrongName.entries.find(row => row.name_en === 'Mimikyu').name_en =
    "Lysandre's Trump Card";
  assert.throws(() => audit(wrongName, field, bans), /banned name/);
  const wrongPrinting = copy(source);
  wrongPrinting.entries.find(row => row.name_en === 'Marshadow').japanese_set =
    'SM3+';
  assert.throws(() => audit(wrongPrinting, field, bans), /collides with banned set/);
});

test('refuses duplicate source card ID and counterfeit copied Mimikyu ID', () => {
  const duplicate = copy(source);
  duplicate.entries.find(row => row.name_en === 'Mimikyu').japanese_card_id =
    duplicate.entries[0].japanese_card_id;
  assert.throws(() => audit(duplicate, field, bans), /duplicate Japanese ID/);
  const swapped = copy(source);
  swapped.entries.find(row => row.name_en === 'Mimikyu').japanese_card_id =
    999999;
  assert.throws(() => audit(swapped, field, bans),
    /Expected values to be strictly deep-equal/);
});
