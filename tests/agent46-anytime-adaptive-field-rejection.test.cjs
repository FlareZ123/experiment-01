'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,PROTOCOL,anytimeAdaptiveFieldRejection}=
  require('../simulation/evaluation/agent46-anytime-adaptive-field-rejection.cjs');

const FIXED='f'.repeat(64),SOURCE='1'.repeat(64);
const roster=()=>Array.from({length:32},(_,i)=>({
  rank:i+1,printed60Sha256:SOURCE,physicalCards:60
}));
/** @param {number} index @param {number} [cell] @param {number} [C] */
function paperLoss(index,cell=0,C=32){
  return {trialIndex:index,gameId:'original-game-'+index,
    cell,rank:Math.floor(cell/(C/32))+1,
    candidateSeat:C===32?undefined:Math.floor((cell%(C/32))/(C/64)),
    startingSeat:C===128?cell%2:undefined,
    candidatePrinted60Digest:FIXED,sourcePrinted60Digest:SOURCE,
    sourceDealFingerprint:(index+1).toString(16).padStart(64,'0'),
    status:'QUALIFIED_NONWIN'};
}
/** @param {object[]} games @param {object} [extra] */
function run(games,extra={}){
  return anytimeAdaptiveFieldRejection({candidateOrdinal:1,
    candidateId:'one-frozen-hypothetical-sixty',candidatePrinted60Digest:FIXED,
    layout:'RANK',selectionProtocol:PROTOCOL,
    externalRegistrationId:'hypothetical-prospective-source-nonwins',
    freshConditionalCellGameDraws:true,
    authenticatedOriginalPrints:roster(),games,...extra});
}
test('zero genuine paper losses leave full-field upper bound 1',()=>{
  const r=run([]);
  assert.equal(VERSION,'agent46-anytime-adaptive-field-rejection-v1');
  assert.equal(r.registeredGames,0);
  assert.equal(r.fieldWinRateUpperBound,1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(r.competitiveQualified,false);
});
test('five real hypothetical losses against one original rank exclude 99.5 field',()=>{
  const r=run(Array.from({length:5},(_,i)=>paperLoss(i)));
  assert.equal(r.genuineQualifiedPaperNonwins,5);
  assert.equal(r.genuineQualifiedPaperWins,0);
  assert.equal(r.observedCells,1);
  assert.ok(Math.abs(r.perCell[0].nonwinRateLowerBound-.18741641498072537)<1e-11);
  assert.ok(Math.abs(r.fieldWinRateUpperBound-.9941432370318523)<1e-11);
  assert.equal(r.decision,'CONDITIONAL_EVIDENCE_FIELD_CANNOT_REACH_TARGET');
  assert.equal(r.statisticalAssumptionsExternallyVerified,false);
  assert.equal(r.competitiveQualified,false);
});
test('only four uninterrupted losses remain insufficient for exclusion',()=>{
  const r=run(Array.from({length:4},(_,i)=>paperLoss(i)));
  assert.ok(r.fieldWinRateUpperBound>.995);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});
test('one complete rank disproof survives three missing original source ranks',()=>{
  const r=run(Array.from({length:5},(_,i)=>paperLoss(i)),{
    authenticatedOriginalPrints:roster().filter(x=>![23,25,28].includes(x.rank))});
  assert.equal(r.authenticatedSourceRanks,29);
  assert.equal(r.observedCells,1);
  assert.equal(r.decision,'CONDITIONAL_EVIDENCE_FIELD_CANNOT_REACH_TARGET');
});
test('censored or unauthenticated source losses cannot falsify the target',()=>{
  const a=Array.from({length:5},(_,i)=>paperLoss(i));
  for(const x of a)x.status='CENSORED';
  const r=run(a);
  assert.equal(r.genuineQualifiedPaperNonwins,0);
  assert.equal(r.censoredGames,5);
  assert.equal(r.fieldWinRateUpperBound,1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  const b=Array.from({length:5},(_,i)=>paperLoss(i));
  for(const x of b)x.sourcePrinted60Digest='b'.repeat(64);
  const invalid=run(b);
  assert.equal(invalid.censoredGames,5);
  assert.equal(invalid.fieldWinRateUpperBound,1);
});
test('single rank losses and many games elsewhere do not erase valid exclusion',()=>{
  const a=Array.from({length:5},(_,i)=>paperLoss(i));
  for(let i=5;i<325;i++){
    const cell=1+(i%31);
    const entry=paperLoss(i,cell);
    entry.status='QUALIFIED_WIN';
    a.push(entry);
  }
  const r=run(a);
  assert.equal(r.genuineQualifiedPaperNonwins,5);
  assert.equal(r.genuineQualifiedPaperWins,320);
  assert.equal(r.decision,'CONDITIONAL_EVIDENCE_FIELD_CANNOT_REACH_TARGET');
  assert.equal(r.perCell[0].winRateUpperBound<.84,true);
});
test('second precommitted claim ordinal requires six instead of five same-cell losses',()=>{
  const a=Array.from({length:5},(_,i)=>paperLoss(i));
  const r=run(a,{candidateOrdinal:2});
  assert.ok(Math.abs(r.cellThreshold-3840)<1e-8);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  a.push(paperLoss(5));
  assert.equal(run(a,{candidateOrdinal:2}).decision,
    'CONDITIONAL_EVIDENCE_FIELD_CANNOT_REACH_TARGET');
});
test('rank-seat and starter cells remain separate and increase sample demand',()=>{
  for(const layout of ['RANK_SEAT','RANK_SEAT_START']){
    const C=layout==='RANK_SEAT'?64:128;
    const a=Array.from({length:5},(_,i)=>paperLoss(i,0,C));
    assert.equal(run(a,{layout}).decision,'INSUFFICIENT_INFORMATION');
    const b=Array.from({length:36},(_,i)=>paperLoss(i,0,C));
    assert.equal(run(b,{layout}).decision,
      'CONDITIONAL_EVIDENCE_FIELD_CANNOT_REACH_TARGET');
  }
});
test('duplicated source setup, candidate swap and fake native status hard fail',()=>{
  const a=[paperLoss(0),paperLoss(1)];
  a[1].sourceDealFingerprint=a[0].sourceDealFingerprint;
  assert.throws(()=>run(a),/Repeated physical/);
  const b=[paperLoss(0)];b[0].candidatePrinted60Digest='0'.repeat(64);
  assert.throws(()=>run(b),/Altered/);
  const c=[paperLoss(0)];c[0].status='NATIVE_LOSS';
  assert.throws(()=>run(c),/Altered/);
});
test('trial chronology and protocol enforced',()=>{
  const a=[paperLoss(0),paperLoss(1)];
  a[1].trialIndex=3;
  assert.throws(()=>run(a),/Altered/);
  assert.throws(()=>run([paperLoss(0)],{
    selectionProtocol:'PROSPECTIVE_ADAPTIVELY_SELECTED_FIELD_CELLS_V1'}),/protocol/);
  assert.throws(()=>run([paperLoss(0)],{
    freshConditionalCellGameDraws:false}),/registration/);
});
