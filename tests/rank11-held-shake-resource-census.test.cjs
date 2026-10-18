'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {CATEGORIES,choose,census} =
  require('../scripts/rank11-held-shake-resource-census.cjs');

test('printed rank11 partition, exact binomial controls', () => {
  assert.equal(CATEGORIES.reduce((sum,g) => sum + g.count,0),60);
  assert.equal(CATEGORIES.filter(g => g.basic)
    .reduce((sum,g) => sum + g.count,0),11);
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(52,6),20358520n);
  assert.equal(choose(52,-1),0n);
  assert.equal(choose(52,53),0n);
});

test('source K0 VIP+held Shake+any Tool upper bound includes Prize risk', () => {
  const r = census();
  assert.equal(r.visited,16088);
  assert.equal(r.validWorlds,324031005021884160n,
    'Must reproduce independent source rank11 legal-initial-7 denominator');
  assert.equal(r.heldResourceWorlds,14140249441478160n);
  assert.equal(r.searchReadyWorlds,13003476027133872n);
  assert.ok(r.searchReadyWorlds < r.heldResourceWorlds);
  assert.ok(Math.abs(r.resourcePercent-4.363856921816221)<1e-11);
  assert.ok(Math.abs(r.searchReadyPercent-4.013034501514956)<1e-11);
});
