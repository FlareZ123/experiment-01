'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {verifyManifest} = require('../simulation/twinleaf/new-moon-lockbreak-validate.cjs');
const {choose, directByFirstDraw, main} = require('../scripts/new-moon-lockbreak-access.cjs');

test('Frozen 60 follows precisely the intended four-card counter package', () => {
  const x = verifyManifest();
  assert.equal(x.hash, 'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(x.counts['Pokémon'], 19);
  assert.equal(x.counts.Trainer, 35);
  assert.equal(x.counts.Energy, 6);
});

test('Exact finite opening combinatorics match independent rational values', () => {
  assert.equal(String(choose(60, 6)), '50063860');
  assert.deepEqual(directByFirstDraw(17, 0), {
    numerator: '0', denominator: '1', probability: 0
  });
  const f = directByFirstDraw(17, 2);
  assert.equal(f.numerator, '416435');
  assert.equal(f.denominator, '1708349');
  assert.ok(Math.abs(f.probability - 0.2437645937686035) < 1e-14);
  const any = directByFirstDraw(17, 4);
  assert.equal(any.numerator, '479458943');
  assert.equal(any.denominator, '1103593454');
  assert.ok(Math.abs(any.probability - 0.4344525071820515) < 1e-14);
});

test('The access report retains source/variant identity and scope', () => {
  const x = main();
  assert.equal(x.initialBasicCount, 17);
  assert.equal(x.source.fieldBlower.probability, 0);
  assert.equal(x.source.cologne.probability, 0);
  assert.equal(x.lockbreak.fieldBlower.probability, x.lockbreak.cologne.probability);
  assert.equal(x.lockbreak.eitherNamedItem.probability > x.lockbreak.fieldBlower.probability, true);
  assert.equal(x.fixedListHash, 'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
});

test('Human-readable New Moon deck rows match the frozen machine 60', () => {
  const {readFileSync} = require('node:fs');
  const path = require('node:path');
  const proposal = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
  const report = readFileSync(path.join(__dirname,
    '../results/als/new-moon-lockbreak-60-candidate.md'), 'utf8');
  const heading = '## Exact fixed 60 (selected English equivalent printings)';
  assert.equal(report.split(heading).length, 2);
  const section = report.split(heading)[1].split('**Totals:')[0];
  const types = {P: 'Pokémon', T: 'Trainer', E: 'Energy'};
  const rows = [...section.matchAll(/^\|\s*([PTE])\s*\|\s*(\d+)\s*\|\s*([^|]+)\|/gm)]
    .map(match => ({
      type: types[match[1]],
      count: Number(match[2]),
      name: match[3].split(',')[0].trim()
    }));
  const canonical = entries => entries.map(x => [x.type, x.name, x.count].join(':'))
    .sort();
  assert.equal(rows.length, proposal.entries.length);
  assert.equal(rows.reduce((sum, row) => sum + row.count, 0), 60);
  assert.deepEqual(canonical(rows), canonical(proposal.entries.map(row => ({
    type: row.type, name: row.name_en, count: row.count
  }))));
});

test('Frozen simulator alias annotations agree with the audited source map', () => {
  const source = require('../results/als/new-moon-perfection-english-map.json');
  const proposal = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
  const byId = new Map(source.entries.map(row => [row.id, row]));
  for (const row of proposal.entries) {
    const original = byId.get(row.english_proxy_card_id);
    if (original && row.twinleaf_full_name) {
      assert.equal(row.twinleaf_full_name, original.twinleaf_full_name,
        'Stale simulator alias for ' + row.name_en);
    }
  }
});
