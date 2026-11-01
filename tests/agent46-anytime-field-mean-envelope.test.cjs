'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,anytimeFieldMeanEnvelope}=
  require('../simulation/evaluation/agent46-anytime-field-mean-envelope.cjs');

/** @param {number} size @param {number} wins @param {number} nonWins @param {number} censored */
function rows(size=32,wins=0,nonWins=0,censored=0){
  return Array.from({length:size},()=>({wins,nonWins,censored}));
}

/** @param {Array<{wins:number,nonWins:number,censored:number}>} cells @param {number} candidateOrdinal */
function check(cells,candidateOrdinal=1){
  return anytimeFieldMeanEnvelope({cells,candidateOrdinal});
}

test('no matches mean no inference and no counterfeit 99.5% success',()=>{
  const r=check(rows());
  assert.equal(VERSION,'agent46-anytime-field-mean-envelope-v1');
  assert.equal(r.attempts,0);
  assert.equal(r.untestedCells,32);
  assert.equal(r.lowerFieldMean,0);
  assert.equal(r.upperFieldMean,1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(r.competitiveQualified,false);
  assert.equal(r.intervals[0].radius,null);
});

test('nine independent nonwins on one rank exclude an otherwise perfect 32-rank candidate',()=>{
  const eight=rows();
  eight[10].nonWins=8;
  const nine=rows();
  nine[10].nonWins=9;
  const before=JSON.stringify(nine);
  const a=check(eight);
  const b=check(nine);
  assert.equal(a.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(b.decision,'BELOW_TARGET_UPPER_BOUND');
  assert.ok(b.upperFieldMean<0.995);
  assert.equal(b.untestedCells,31);
  assert.equal(b.intervals[10].upper<0.84,true);
  assert.equal(JSON.stringify(nine),before,
    'Counting intervals must not modify the registered game ledger');
});

test('adaptively chosen second candidate pays a larger simultaneous testing budget',()=>{
  const losses=rows();
  losses[0].nonWins=9;
  const first=check(losses,1);
  const second=check(losses,2);
  assert.ok(second.intervals[0].radius>first.intervals[0].radius);
  assert.equal(first.decision,'BELOW_TARGET_UPPER_BOUND');
  assert.equal(second.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(second.candidateOrdinal,2);
});

test('unfinished games are never silently counted as wins or discarded',()=>{
  const pending=rows();
  pending[0]={wins:0,nonWins:0,censored:100};
  const allUnknown=check(pending);
  assert.equal(allUnknown.attempts,100);
  assert.equal(allUnknown.censoredAttempts,100);
  assert.equal(allUnknown.intervals[0].lower,0);
  assert.equal(allUnknown.intervals[0].upper,1);
  assert.equal(allUnknown.decision,'INSUFFICIENT_INFORMATION');
  const partly=rows();
  partly[0]={wins:0,nonWins:9,censored:20};
  const r=check(partly);
  assert.equal(r.intervals[0].attempts,29);
  assert.equal(r.intervals[0].wins,0);
  assert.ok(r.intervals[0].upper>=20/29);
  assert.ok(r.intervals[0].upper<=1);
});

test('hypothetical uniform million undefeated games per rank passes only statistical gate',()=>{
  const r=check(rows(32,1_000_000,0,0));
  assert.equal(r.attempts,32_000_000);
  assert.equal(r.decision,'ABOVE_TARGET_LOWER_BOUND');
  assert.ok(r.lowerFieldMean>=0.995);
  assert.equal(r.competitiveQualified,false,
    'Arithmetic on invented result counts cannot certify real competition');
});

test('64 equal rank-seat cells preserve the established fixed-horizon estimand',()=>{
  const x=check(rows(64,1_000_000,0,0));
  assert.equal(x.cellCount,64);
  assert.equal(x.attempts,64_000_000);
  assert.equal(x.decision,'ABOVE_TARGET_LOWER_BOUND');
  const partly=rows(64);
  partly[0].nonWins=9;
  assert.equal(check(partly).decision,'INSUFFICIENT_INFORMATION',
    'Nine nonwins at one of 64 seats need not veto the entire 64-cell mean');
});

test('all 128 seat-start-rank cells are equally weighted and missing cells remain unknown',()=>{
  const four=check(rows(128,1_000_000,0,0));
  assert.equal(four.cellCount,128);
  assert.equal(four.decision,'ABOVE_TARGET_LOWER_BOUND');
  const missing=rows(32,1_000_000,0,0);
  missing[22]={wins:0,nonWins:0,censored:0};
  missing[24]={wins:0,nonWins:0,censored:0};
  missing[27]={wins:0,nonWins:0,censored:0};
  const r=check(missing);
  assert.equal(r.untestedCells,3);
  assert.ok(r.lowerFieldMean<=29/32);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});

test('minimal all-nonwin single-cell pruning counts across preregistered stratum sizes and candidate ordinals',()=>{
  // Counts are hypothetical calculations, not observed Aichi games.
  for(const [cellCount,ordinal,minCount] of [
    [32,1,9],[32,2,10],[32,50,15],
    [64,1,16],[64,2,17],[64,50,24],
    [128,1,69],[128,2,74],[128,50,99]
  ]){
    const outcome=rows(cellCount);
    outcome[0].nonWins=minCount-1;
    assert.equal(check(outcome,ordinal).decision,
      'INSUFFICIENT_INFORMATION');
    outcome[0].nonWins=minCount;
    const result=check(outcome,ordinal);
    assert.equal(result.decision,'BELOW_TARGET_UPPER_BOUND');
    assert.ok(result.upperFieldMean<0.995);
    assert.equal(result.competitiveQualified,false);
  }
});

test('reject invalid weights, count precision and multiple-deck ordinals',()=>{
  const cases=[
    {cells:rows(31),candidateOrdinal:1},
    {cells:rows(33),candidateOrdinal:1},
    {cells:rows(),candidateOrdinal:0},
    {cells:rows(),candidateOrdinal:1.5},
    {cells:rows(),candidateOrdinal:1,alpha:1},
    {cells:rows(),candidateOrdinal:1,target:-0.5}
  ];
  for(const cfg of cases)assert.throws(()=>anytimeFieldMeanEnvelope(cfg),
    /Expected/);
  for(const malformed of [
    {wins:-1,nonWins:0,censored:0},
    {wins:1.5,nonWins:0,censored:0},
    {wins:0,nonWins:0},
    {wins:NaN,nonWins:0,censored:0}
  ]){
    const c=rows();c[0]=malformed;
    assert.throws(()=>check(c),/Invalid/);
  }
  const overflow=rows();
  overflow[0]={wins:Number.MAX_SAFE_INTEGER,nonWins:1,censored:0};
  assert.throws(()=>check(overflow),/precision/);
});
