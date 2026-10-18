'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {schedule, N, SEED_LABEL} =
  require('../simulation/twinleaf/rank11-held-shake-source-screen.cjs');

test('precommitted source schedule is complete, balanced and content-addressed', () => {
  assert.equal(N, 80);
  assert.equal(SEED_LABEL,
    'agent6-rank11-held-shake-v1-20261018-precommitted');
  const rows = schedule();
  assert.equal(rows.length, 80);
  assert.equal(new Set(rows.map(r => r.trialId)).size, 80);
  assert.equal(new Set(rows.map(r => r.seed)).size, 80);
  assert.equal(rows.filter(r => r.sourceSeat === 0).length, 40);
  assert.equal(rows.filter(r => r.sourceSeat === 1).length, 40);
  assert.deepEqual(rows.slice(0, 3), [
    {trialId: 'held-shake:0', seed: 3932179699, sourceSeat: 0},
    {trialId: 'held-shake:1', seed: 2783397336, sourceSeat: 1},
    {trialId: 'held-shake:2', seed: 2206650688, sourceSeat: 0}
  ]);
  assert.deepEqual(rows[79],
    {trialId: 'held-shake:79', seed: 1584394834, sourceSeat: 1});
  assert.equal(crypto.createHash('sha256')
    .update(JSON.stringify(rows)).digest('hex'),
    '2acd32fbdac8dbe9c3366c496f26583e7db0a4689855f2f12d8881fcc17956b6');
  assert.deepEqual(schedule(), rows);
});
