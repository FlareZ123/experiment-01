'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose, calculate} = require('../scripts/aichi_stadium_lock_response.cjs');

test('combination integer identities', () => {
  assert.equal(choose(60, 7), 386206920);
  assert.equal(choose(53, 6), 22957480);
  assert.equal(choose(6, 3), 20);
  assert.equal(choose(5, 6), 0);
});
test('published rank one fixed-opening Stadium response probabilities', () => {
  const field = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'), 'utf8'));
  const audit = calculate(field);
  assert.deepEqual(audit.cardCounts,
    {deck:60,hand:7,prizes:6,basic:14,stadium:3,stone:1,shadowRiderV:3});
  const {fractions:p}=audit;
  assert.ok(Math.abs(p.directStadiumGivenValid-0.30215174095)<1e-9);
  assert.ok(Math.abs(p.stoneCanFindStadiumGivenValid-0.02856430208)<1e-9);
  assert.ok(Math.abs(p.eitherResponseGivenValid-0.33071604303)<1e-9);
  assert.ok(p.eitherResponseGivenValid<1);
});
