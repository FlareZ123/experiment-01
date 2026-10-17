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
