'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION, anytimeBalancedPairedFieldDelta} =
  require('../simulation/evaluation/agent46-anytime-balanced-paired-field-delta.cjs');
const {anytimePairedFieldDelta} =
  require('../simulation/evaluation/agent46-anytime-paired-field-delta.cjs');

/**
 * @param {number} C
 * @param {number} rounds
 * @param {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} challenger
 * @param {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} reference
 */
function cells(C=32,rounds=0,challenger='CENSORED',reference='CENSORED') {
  return Array.from({length:C},(_,i)=>Array.from({length:rounds},(_,j)=>({
    pairId:`r${i}-t${j}`,roundId:`registration-${j}`,
    referenceFingerprint:`setup-${i}-${j}`,
    challengerFingerprint:`setup-${i}-${j}`,
    referenceStatus:reference,challengerStatus:challenger
  })));
}

/** @param {ReturnType<typeof cells>} data @param {number} [candidateOrdinal] */
function check(data,candidateOrdinal=1) {
  return anytimeBalancedPairedFieldDelta({candidateOrdinal,cells:data});
}

test('no balanced rounds produce no inferred advantage',()=>{
  const r=check(cells());
  assert.equal(VERSION,'agent46-anytime-balanced-paired-field-delta-v1');
  assert.equal(r.method,'BALANCED_INDEPENDENT_CELLS');
  assert.equal(r.completedRounds,0);
  assert.equal(r.radius,null);
  assert.equal(r.registeredPairs,0);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(r.competitiveQualified,false);
});

test('one registered round with native censorship remains maximally ambiguous',()=>{
  const r=check(cells(32,1));
  assert.equal(r.registeredPairs,32);
  assert.equal(r.censoredPairs,32);
  assert.equal(r.lowerFieldDelta,-1);
  assert.equal(r.upperFieldDelta,1);
});

test('100 balanced independent rounds use pooled across-cell concentration',()=>{
  const data=cells(32,100,'QUALIFIED_WIN','QUALIFIED_NONWIN');
  const before=JSON.stringify(data);
  const pooled=check(data);
  const old=anytimePairedFieldDelta({candidateOrdinal:1,cells:data});
  assert.equal(pooled.registeredPairs,3200);
  assert.equal(pooled.completedRounds,100);
  assert.equal(pooled.decision,'IMPROVEMENT_ABOVE_TARGET');
  assert.ok(Math.abs(pooled.radius-0.09220329894282266)<1e-12);
  assert.ok(pooled.radius<old.intervals[0].radius);
  assert.ok(pooled.lowerFieldDelta>old.lowerFieldDelta);
  assert.equal(pooled.competitiveQualified,false);
  assert.equal(JSON.stringify(data),before);
});

test('negative balanced contrast and equal observed outcomes',()=>{
  const losing=check(cells(64,100,'QUALIFIED_NONWIN','QUALIFIED_WIN'));
  assert.equal(losing.decision,'UNDERPERFORMANCE_BELOW_TARGET');
  assert.ok(losing.upperFieldDelta<0);
  const equal=check(cells(32,100,'QUALIFIED_WIN','QUALIFIED_WIN'));
  assert.equal(equal.decision,'INSUFFICIENT_INFORMATION');
  assert.ok(equal.lowerFieldDelta<0);
  assert.ok(equal.upperFieldDelta>0);
});

test('mispaired fingerprints stay in denominator and destroy apparent advantage',()=>{
  const data=cells(32,100,'QUALIFIED_WIN','QUALIFIED_NONWIN');
  for(const row of data)for(const pair of row)pair.challengerFingerprint+='-other';
  const result=check(data);
  assert.equal(result.registeredPairs,3200);
  assert.equal(result.unmatchedPairs,3200);
  assert.equal(result.censoredPairs,3200);
  assert.equal(result.lowerFieldDelta,-1);
  assert.equal(result.upperFieldDelta,1);
  assert.equal(result.decision,'INSUFFICIENT_INFORMATION');
});

test('mixed qualified/censored one-sided game arms never appear as a win',()=>{
  const data=cells(64,100,'QUALIFIED_WIN','CENSORED');
  const result=check(data);
  assert.equal(result.empiricalLower,0);
  assert.equal(result.empiricalUpper,1);
  assert.equal(result.lowerFieldDelta<0,true);
  assert.equal(result.decision,'INSUFFICIENT_INFORMATION');
});

test('candidate ordinal spending and 128-cell resolution are explicit',()=>{
  const data=cells(128,100,'QUALIFIED_WIN','QUALIFIED_NONWIN');
  const first=check(data,1);
  const later=check(data,50);
  assert.equal(first.cellCount,128);
  assert.equal(first.registeredPairs,12800);
  assert.ok(later.radius>first.radius);
  assert.ok(first.radius<0.05);
});

test('unbalanced attempts fail before any headline statistic is produced',()=>{
  const data=cells(32,4,'QUALIFIED_WIN','QUALIFIED_NONWIN');
  data[31].pop();
  assert.throws(()=>check(data),/Balanced confidence requires/);
});

test('missing, duplicated or rearranged registered rounds fail closed',()=>{
  const data=cells(32,2,'QUALIFIED_WIN','QUALIFIED_NONWIN');
  data[1][1].roundId='other';
  assert.throws(()=>check(data),/unique common registered roundId/);
  data[1][1].roundId='registration-1';
  data[0][1].roundId='registration-0';
  for(const row of data) row[1].roundId='registration-0';
  assert.throws(()=>check(data),/unique common registered roundId/);
  for(const row of data) row[1].roundId='';
  assert.throws(()=>check(data),/unique common registered roundId/);
});

test('native terminal statuses cannot be treated as certified paper wins',()=>{
  const data=cells(32,1,'QUALIFIED_WIN','QUALIFIED_NONWIN');
  data[0][0].challengerStatus='NATIVE_WIN';
  assert.throws(()=>check(data),/independently QUALIFIED/);
});
