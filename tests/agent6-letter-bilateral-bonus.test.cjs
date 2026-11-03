'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {allBonusLetterOpportunity,known29LetterOpportunities}=
  require('../scripts/agent6-letter-bilateral-bonus.cjs');
test('4-Basic opponent bilateral offer distribution and tiny omitted tail',()=>{
  const a=allBonusLetterOpportunity(4);
  assert.ok(Math.abs(a.allBonusProbability-0.13578921640009822)<1e-13);
  assert.ok(Math.abs(a.offeredBonusProbability-0.5389161854673047)<1e-13);
  assert.ok(Math.abs(a.omittedKAtLeast47-3.49246624973616e-11)<1e-18);
  assert.equal(a.competitiveQualifiedGames,0);
});
test('more opponent Basics reduces optional source compensation',()=>{
  let previous=-Infinity;
  for(const b of [4,10,11,12,13,14,15,16,60]){
    const x=allBonusLetterOpportunity(b);
    assert.ok(x.allBonusProbability>previous);
    assert.ok(x.allBonusProbability<=x.baselineProbability+1e-15);
    previous=x.allBonusProbability;
  }
  assert.equal(allBonusLetterOpportunity(60).omittedKAtLeast47,0);
  assert.throws(()=>allBonusLetterOpportunity(0));
});
test('known 29 printed source Basic counts and missing ranks',()=>{
  const audit=require('../results/aichi-2026/opening-hand-audit.json');
  const report=known29LetterOpportunities(audit);
  assert.ok(Math.abs(report.equalRankAverage-0.14831009839564652)<1e-13);
  assert.equal(report.rows.length,29);
  assert.deepEqual(report.missingRanks,[23,25,28]);
});
