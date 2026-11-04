'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {originalSourceBonus32Bound}=
  require('../scripts/agent3-source-bonus-field-32-bound.cjs');
const {sourceBonusDisagreement}=
  require('../simulation/evaluation/agent3-source-bonus-coupled-mulligan-model.cjs');
const {frozenRankOneNewMoonCase}=
  require('../simulation/evaluation/agent3-coupled-opening-input-order.cjs');

const close=(x,y)=>assert.ok(Math.abs(x-y)<1e-12,`${x} vs ${y}`);

test('exact authentic 29 ranks and honest three-missing-source 32 rank bounds',()=>{
  const record=originalSourceBonus32Bound();
  assert.equal(record.originalAuthenticatedSources,29);
  assert.deepEqual(record.missingOriginalSourceRanks,[23,25,28]);
  assert.equal(record.competitivelyQualifiedGameCount,0);
  const order=record.projections.originalSourceRowOrder;
  const max=record.projections.maximalBasicPositionOverlap;
  const min=record.projections.minimalBasicPositionOverlap;
  for(const scenario of [order,max,min]){
    assert.equal(scenario.knownRankCount,29);
    assert.equal(scenario.unknownRankCount,3);
    assert.deepEqual(scenario.missingSourceBasicCountRange,[1,60]);
    assert.equal(scenario.knownRanks.length,29);
    assert.equal(new Set(scenario.knownRanks.map(row=>row.rank)).size,29);
    assert.ok(scenario.verifiedKnownRankAverage>=0);
    assert.ok(scenario.verifiedKnownRankAverage<=1);
    const [lo,hi]=scenario.equalRankFull32MeanProbabilityRange;
    assert.ok(lo<=hi&&lo>=0&&hi<=1);
    const raw=scenario.knownRanks.reduce((sum,row)=>
      sum+row.modelSourceBonusMismatchProbability,0);
    close(scenario.verifiedKnownRankAverage,raw/29);
    close(lo,(raw+3*scenario.missingSingleRankProbabilityRange[0])/32);
    close(hi,(raw+3*scenario.missingSingleRankProbabilityRange[1])/32);
  }
  assert.ok(max.verifiedKnownRankAverage<order.verifiedKnownRankAverage);
  assert.ok(order.verifiedKnownRankAverage<min.verifiedKnownRankAverage);
  assert.equal(order.knownRanks.find(row=>row.rank===6).sourceBasics,4);
  assert.equal(order.knownRanks.find(row=>row.rank===5).sourceBasics,11);
  close(order.knownRanks.find(row=>row.rank===5)
    .modelSourceBonusMismatchProbability,0.090724291631435);
  close(order.knownRanks.find(row=>row.rank===6)
    .modelSourceBonusMismatchProbability,0.0499904236953941);
  console.log('AGENT3_SOURCE_BONUS_ALL32_BOUNDS',
    JSON.stringify(Object.fromEntries(
      Object.entries(record.projections).map(([key,result])=>[key,{
        knownMean:result.verifiedKnownRankAverage,
        possible32Mean:result.equalRankFull32MeanProbabilityRange,
        missingRankRange:result.missingSingleRankProbabilityRange
      }])
    )));
});

test('the unknown three-rank partial-identification bounds contain every source Basic count',()=>{
  const record=originalSourceBonus32Bound();
  const trial=frozenRankOneNewMoonCase();
  const ref=new Set(trial.historicalReferenceBasicPositions);
  const other=new Set(trial.historicalChallengerBasicPositions);
  const a=Array.from({length:60},(_,i)=>ref.has(i));
  const b=Array.from({length:60},(_,i)=>other.has(i));
  const scenario=record.projections.originalSourceRowOrder;
  const [low,high]=scenario.missingSingleRankProbabilityRange;
  for(let basic=1;basic<=60;basic++){
    const expected=sourceBonusDisagreement(a,b,basic)
      .sourceBonusCardCountDisagreement;
    assert.ok(expected>=low-1e-12);
    assert.ok(expected<=high+1e-12);
  }
});

test('the source bonus partial-identification model is deterministic',()=>{
  const first=originalSourceBonus32Bound();
  const second=originalSourceBonus32Bound();
  assert.deepEqual(first,second);
});
