'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {exactEarlyLockOverlap}=
  require('../simulation/evaluation/agent29-early-hand-lock-overlap.cjs');

test('original one-Gengar 60 matches independent one-target combinatorics',()=>{
  const old=exactEarlyLockOverlap({attackerKinds:1});
  assert.equal(old.basicCount,17);
  assert.deepEqual([
    old.unionOpportunity.numerator,old.unionOpportunity.denominator
  ],['103535631241','436442169124']);
  assert.equal(old.competitiveQualifiedGames,0);
});

test('adding one Whismur gains a bounded incremental first-turn lock option',()=>{
  const old=exactEarlyLockOverlap({attackerKinds:1});
  const next=exactEarlyLockOverlap({attackerKinds:2});
  assert.equal(next.basicCount,18);
  assert.deepEqual([
    next.unionOpportunity.numerator,next.unionOpportunity.denominator
  ],['2098980746107','7012740830160']);
  const delta=next.unionOpportunity.probability-
    old.unionOpportunity.probability;
  assert.ok(delta>0.062&&delta<0.063);
  const parts=next.attackerInOpening.probability+
    next.attackerFirstDrawWithLatias.probability+
    next.vipLatiasFallback.probability;
  assert.ok(Math.abs(parts-next.unionOpportunity.probability)<1e-13);
});

test('Basic-only and zero-Energy frontiers remain explicitly lower',()=>{
  const baseline=exactEarlyLockOverlap({
    attackerKinds:1,eligibleEnergyCount:3});
  const improved=exactEarlyLockOverlap({
    attackerKinds:2,eligibleEnergyCount:3});
  assert.deepEqual([
    baseline.unionOpportunity.numerator,
    baseline.unionOpportunity.denominator
  ],['33711231247','243894153334']);
  assert.deepEqual([
    improved.unionOpportunity.numerator,
    improved.unionOpportunity.denominator
  ],['5956255105','34069995936']);
  assert.ok(improved.unionOpportunity.probability>
    baseline.unionOpportunity.probability);
  assert.equal(exactEarlyLockOverlap({
    attackerKinds:2,eligibleEnergyCount:0
  }).unionOpportunity.probability,0);
});
