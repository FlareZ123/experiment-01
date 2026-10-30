'use strict';

const assert = require('node:assert/strict');
const {INVENTORY, choose, survivingPrizeSets,
  exactOranguruBoostShakeWindow} =
  require('../scripts/agent32-rank11-oranguru-boost-shake-window.cjs');

assert.equal(Object.values(INVENTORY).reduce((a, b) => a + b, 0), 60);
assert.equal(choose(60, 0), 1n);
assert.equal(choose(60, 7), 386206920n);
assert.equal(choose(5, 6), 0n);
assert.equal(choose(5, -1), 0n);
const empty = Object.fromEntries(Object.keys(INVENTORY).map(k => [k, 0]));
assert.equal(survivingPrizeSets(empty, []), choose(52, 6));
assert.equal(survivingPrizeSets({...empty, garbodor: 2}, ['garbodor']), 0n);
assert.equal(survivingPrizeSets(empty, ['garbodor']),
  choose(52, 6) - choose(50, 4));
const result = exactOranguruBoostShakeWindow();
assert.equal(result.configurations, 2430);
assert.equal(result.basicCount, 11);
assert.equal(result.unconditional.numerator, '841188685937797');
assert.equal(result.unconditional.denominator, '6128203958276400');
assert.equal(result.conditionalBasicValid.numerator, '841188685937797');
assert.equal(result.conditionalBasicValid.denominator, '4765161838557120');
assert.ok(Math.abs(result.conditionalBasicValid.decimal - 0.17652888074678844) < 1e-14);
const total = Object.values(result.partitionConditionalBasicValid)
  .reduce((n, x) => n + x.decimal, 0);
assert.ok(Math.abs(total - result.conditionalBasicValid.decimal) < 1e-14);
console.log('Agent32 rank11 exact Oranguru lock window: OK',
  JSON.stringify(result, null, 2));
