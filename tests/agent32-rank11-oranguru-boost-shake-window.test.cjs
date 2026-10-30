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
assert.equal(result.unconditional.numerator, '22486527096553');
assert.equal(result.unconditional.denominator, '163547044412400');
assert.equal(result.conditionalBasicValid.numerator, '22486527096553');
assert.equal(result.conditionalBasicValid.denominator, '127170724105920');
assert.ok(Math.abs(result.conditionalBasicValid.decimal - 0.17682157001657124) < 1e-14);
assert.equal(result.partitionConditionalBasicValid.trubbishHeld.numerator,
  '209724224821603');
assert.equal(result.partitionConditionalBasicValid.trubbishHeld.denominator,
  '3447138351296640');
assert.equal(result.partitionConditionalBasicValid.vipStarSearched.numerator,
  '202401854652727');
assert.equal(result.partitionConditionalBasicValid.vipStarSearched.denominator,
  '6750645937955920');
// The old exact direct-Active event deliberately excludes the new Star-fetched
// VIP route. This independent published fraction must be reproduced exactly.
const oldNumerator = 11895095504671537n;
const oldDenominator = 81007751255471040n;
const fraction = (r) => [BigInt(r.numerator), BigInt(r.denominator)];
const [allN, allD] = fraction(result.conditionalBasicValid);
const [newN, newD] = fraction(result.partitionConditionalBasicValid.vipStarSearched);
assert.equal((allN * newD - newN * allD) * oldDenominator,
  oldNumerator * allD * newD);
const total = Object.values(result.partitionConditionalBasicValid)
  .reduce((n, x) => n + x.decimal, 0);
assert.ok(Math.abs(total - result.conditionalBasicValid.decimal) < 1e-14);
console.log('Agent32 rank11 exact Oranguru lock window: OK',
  JSON.stringify(result, null, 2));
