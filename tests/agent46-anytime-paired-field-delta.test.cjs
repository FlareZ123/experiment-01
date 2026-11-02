'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION, anytimePairedFieldDelta} =
  require('../simulation/evaluation/agent46-anytime-paired-field-delta.cjs');

/** @param {number} C */
function empty(C=32) { return Array.from({length:C}, () => []); }

/**
 * @param {number} C
 * @param {number} n
 * @param {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} challenger
 * @param {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} reference
 */
function allPairs(C,n,challenger,reference) {
  return Array.from({length:C}, (_,cell) =>
    Array.from({length:n}, (_,i) => ({
      pairId:`cell${cell}-pair${i}`,referenceFingerprint:`deal-${cell}-${i}`,
      challengerFingerprint:`deal-${cell}-${i}`,
      referenceStatus:reference, challengerStatus:challenger
    })));
}

/** @param {ReturnType<typeof empty>} cells @param {number} [ordinal] */
function check(cells,ordinal=1) {
  return anytimePairedFieldDelta({candidateOrdinal:ordinal,cells});
}

test('zero qualified physical deals cannot produce an apparent deck win',()=>{
  const r=check(empty());
  assert.equal(VERSION,'agent46-anytime-paired-field-delta-v1');
  assert.equal(r.registeredPairs,0);
  assert.equal(r.untestedCells,32);
  assert.equal(r.lowerFieldDelta,-1);
  assert.equal(r.upperFieldDelta,1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(r.competitiveQualified,false);
});

test('every same-deal censored arm stays in denominator as a full range',()=>{
  const cells=allPairs(32,40,'CENSORED','CENSORED');
  const r=check(cells);
  assert.equal(r.registeredPairs,1280);
  assert.equal(r.censoredPairs,1280);
  assert.equal(r.intervals[0].observedLower,-1);
  assert.equal(r.intervals[0].observedUpper,1);
  assert.equal(r.lowerFieldDelta,-1);
  assert.equal(r.upperFieldDelta,1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('one qualified arm against censored reference brackets paired delta [0,1]',()=>{
  const cells=empty();
  cells[0]=allPairs(32,3,'QUALIFIED_WIN','CENSORED')[0];
  const before=JSON.stringify(cells);
  const r=check(cells);
  assert.equal(r.intervals[0].observedLower,0);
  assert.equal(r.intervals[0].observedUpper,1);
  assert.equal(r.intervals[0].censoredPairs,3);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(JSON.stringify(cells),before);
});

test('paired reference success with censored challenger cannot be upgraded to a win',()=>{
  const cells=allPairs(32,50,'CENSORED','QUALIFIED_WIN');
  const r=check(cells);
  assert.equal(r.intervals[0].observedLower,-1);
  assert.equal(r.intervals[0].observedUpper,0);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('prospective 100 same-deal wins per cell prove positive contrast only statistically',()=>{
  const cells=allPairs(32,100,'QUALIFIED_WIN','QUALIFIED_NONWIN');
  const r=check(cells);
  assert.equal(r.registeredPairs,3200);
  assert.equal(r.censoredPairs,0);
  assert.equal(r.decision,'IMPROVEMENT_ABOVE_TARGET');
  assert.ok(r.lowerFieldDelta>0);
  assert.equal(r.competitiveQualified,false);
  const next=check(cells,2);
  assert.ok(next.intervals[0].radius>r.intervals[0].radius);
});

test('100 per-cell reversed winners prove negative contrast; equal outcomes do not',()=>{
  const negative=check(allPairs(32,100,'QUALIFIED_NONWIN','QUALIFIED_WIN'));
  assert.equal(negative.decision,'UNDERPERFORMANCE_BELOW_TARGET');
  assert.ok(negative.upperFieldDelta<0);
  const tied=check(allPairs(32,100,'QUALIFIED_WIN','QUALIFIED_WIN'));
  assert.equal(tied.decision,'INSUFFICIENT_INFORMATION');
  assert.ok(tied.lowerFieldDelta<0 && tied.upperFieldDelta>0);
});

test('64 and 128 prespecified equal-rank/seat/start geometries use their own budgets',()=>{
  for(const C of [64,128]) {
    const r=check(allPairs(C,100,'QUALIFIED_WIN','QUALIFIED_NONWIN'));
    assert.equal(r.cellCount,C);
    assert.equal(r.registeredPairs,100*C);
    assert.ok(r.lowerFieldDelta>0);
  }
  const a=check(allPairs(32,10,'QUALIFIED_WIN','QUALIFIED_NONWIN'));
  const b=check(allPairs(64,10,'QUALIFIED_WIN','QUALIFIED_NONWIN'));
  assert.ok(b.intervals[0].radius>a.intervals[0].radius);
});

test('wrong source physical setup and duplicated pairs must fail closed',()=>{
  const cells=empty();
  cells[0]=allPairs(32,1,'QUALIFIED_WIN','QUALIFIED_NONWIN')[0];
  cells[0][0].challengerFingerprint='different-physical-setup';
  assert.throws(()=>check(cells),/unmatched source physical-deal/);
  cells[0][0].challengerFingerprint=cells[0][0].referenceFingerprint;
  cells[1]=[{...cells[0][0]}];
  assert.throws(()=>check(cells),/Duplicate pair/);
});

test('reject unqualified-as-win labels, invalid budgets and rank geometry',()=>{
  const cases=[
    {candidateOrdinal:1,cells:empty(31)},
    {candidateOrdinal:0,cells:empty()},
    {candidateOrdinal:1.1,cells:empty()},
    {candidateOrdinal:1,cells:empty(),alpha:1},
    {candidateOrdinal:1,cells:empty(),targetDelta:2}
  ];
  for(const config of cases)assert.throws(()=>anytimePairedFieldDelta(config),/Expected/);
  const cells=allPairs(32,1,'QUALIFIED_WIN','QUALIFIED_NONWIN');
  cells[0][0].referenceStatus='NATIVE_ENGINE_WIN';
  assert.throws(()=>check(cells),/independently QUALIFIED/);
});
