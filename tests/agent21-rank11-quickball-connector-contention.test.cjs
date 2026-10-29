'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/full-decklists.json')
  .decks.find(deck=>deck.rank===11);
const {choose}=require('../scripts/agent21-rank11-quickball-prize-frontier.cjs');
const {sourcePartition,prizeWays,enumerate}=
  require('../scripts/agent21-rank11-quickball-connector-contention.cjs');
const r=enumerate(source);

test('rank11 source categories are disjoint and Basic count correct',()=>{
  assert.deepEqual(sourcePartition(source),
    [2,2,2,6,4,4,3,8,3,6,20]);
  assert.equal(r.denominator,324031005021884160n);
});
test('Prize inclusion-exclusion for two and three required targets',()=>{
  assert.equal(prizeWays([2,2]),
    choose(52,6)-2n*choose(50,4)+choose(48,2));
  assert.equal(prizeWays([2,2,3]),
    choose(52,6)-2n*choose(50,4)-choose(49,3)+
    choose(48,2)+2n*choose(47,1));
  assert.equal(prizeWays([0,2,3]),0n);
});
test('all Quick-only prize-safe hands reconcile with prior independently computed event',()=>{
  assert.equal(r.quickPrize,6841036302154704n);
});
test('Dark Patch overlap splits into competing or composable connectors',()=>{
  assert.equal(r.quickPatchEnergy,887394561799680n);
  assert.equal(r.quickPatchEnergyHeldBenchMega,117605890455552n);
  assert.equal(r.oneQuickCompetesMegaFetch,697245824110176n);
  assert.equal(r.twoQuickCanFetchBoth,69338151492192n);
  assert.equal(r.noSearchableMegaAmongOverlap,3204695741760n);
  assert.equal(r.quickPatchEnergy,
    r.quickPatchEnergyHeldBenchMega+
    r.oneQuickCompetesMegaFetch+
    r.twoQuickCanFetchBoth+
    r.noSearchableMegaAmongOverlap);
});
console.log(JSON.stringify({
  scope:'same-Quick connector contention, exact card locations only',
  quickPrizeSafe:Number(r.quickPrize)/Number(r.denominator),
  quickPatchEnergy:Number(r.quickPatchEnergy)/Number(r.denominator),
  oneQuickMegaSearchConflict:
    Number(r.oneQuickCompetesMegaFetch)/Number(r.denominator)
},null,2));
