'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,PROTOCOL,COUNTS,cellLogE,cellAnytimeLowerBound,
  anytimeAdaptiveFieldEnvelope}=
  require('../simulation/evaluation/agent46-anytime-adaptive-field-envelope.cjs');

const FIXED='f'.repeat(64),SOURCE='1'.repeat(64);
const roster=(n=32)=>Array.from({length:n},(_,i)=>({
  rank:i+1,printed60Sha256:SOURCE,physicalCards:60
}));
/** @param {number} cell @param {number} index @param {number} C */
function game(cell,index,C=32){
  const rank=Math.floor(cell/(C/32))+1;
  return {trialIndex:index,gameId:'game-'+index,cell,rank,
    candidateSeat:C===32?undefined:Math.floor((cell%(C/32))/(C/64)),
    startingSeat:C===128?cell%2:undefined,
    candidatePrinted60Digest:FIXED,sourcePrinted60Digest:SOURCE,
    sourceDealFingerprint:(index+1).toString(16).padStart(64,'0'),
    status:'QUALIFIED_WIN'};
}
/** @param {object[]} games @param {object} [overrides] */
function check(games,overrides={}){
  return anytimeAdaptiveFieldEnvelope({candidateOrdinal:1,
    candidateId:'frozen-hypothetical-candidate',candidatePrinted60Digest:FIXED,
    layout:'RANK',selectionProtocol:PROTOCOL,
    externalRegistrationId:'prospective-synthetic-adaptive-trials',
    freshConditionalCellGameDraws:true,
    authenticatedOriginalPrints:roster(),games,...overrides});
}
test('pure e-value is 1 at zero games and cell inversion is monotonic',()=>{
  assert.equal(VERSION,'agent46-anytime-adaptive-field-envelope-v1');
  assert.equal(PROTOCOL,'PROSPECTIVE_ADAPTIVELY_SELECTED_FIELD_CELLS_V1');
  assert.equal(COUNTS.RANK_SEAT_START,128);
  assert.ok(Math.abs(cellLogE(0,0,.995))<1e-12);
  const q=cellAnytimeLowerBound(1800,0,Math.log(1280));
  assert.ok(Math.abs(q-.99502232307845)<1e-10);
  assert.ok(cellAnytimeLowerBound(2000,0,Math.log(1280))>q);
  assert.ok(cellAnytimeLowerBound(1800,1,Math.log(1280))<q);
});
test('zero games never yield nonzero evidence',()=>{
  const r=check([]);
  assert.equal(r.fieldLowerBound,0);
  assert.equal(r.observedCells,0);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(r.competitiveQualified,false);
});
test('all 32 fully sampled synthetic cells cross 99.5% at 1800 wins per rank',()=>{
  const games=[],nPerCell=1800;
  for(let n=0;n<nPerCell;n++)
    for(let cell=0;cell<32;cell++)
      games.push(game(cell,games.length));
  const r=check(games);
  assert.equal(r.registeredGames,57600);
  assert.equal(r.qualifiedWins,57600);
  assert.equal(r.observedCells,32);
  assert.ok(r.fieldLowerBound>.995);
  assert.equal(r.decision,'CONDITIONAL_FIELD_LOWER_BOUND_EXCEEDS_TARGET');
  assert.equal(r.statisticalAssumptionsExternallyVerified,false);
  assert.equal(r.competitiveQualified,false);
});
test('unobserved cell stays zero despite 31 other well-sampled rank wins',()=>{
  const games=[];
  for(let i=0;i<1800;i++)
    for(let cell=0;cell<31;cell++)
      games.push(game(cell,games.length));
  const r=check(games);
  assert.equal(r.observedCells,31);
  assert.equal(r.perCell[31].lowerBound,0);
  assert.ok(r.fieldLowerBound<=31/32);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});
test('missing original 60 pessimistically censors all games on that rank',()=>{
  const games=[];
  for(let n=0;n<1800;n++)
    for(let c=0;c<32;c++)games.push(game(c,games.length));
  const r=check(games,{authenticatedOriginalPrints:roster(31)});
  assert.equal(r.qualifiedWins,55800);
  assert.equal(r.censoredGames,1800);
  assert.equal(r.perCell[31].lowerBound,0);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});
test('adversarial adaptive scheduling cannot inflate unobserved field ranks',()=>{
  const games=Array.from({length:3000},(_,i)=>game(i%2,i));
  const r=check(games);
  assert.equal(r.observedCells,2);
  assert.ok(r.fieldLowerBound<.1);
  assert.equal(r.decision,'INSUFFICIENT_INFORMATION');
});
test('64 rank-seat and 128 rank-seat-starter geometry validated',()=>{
  for(const layout of ['RANK_SEAT','RANK_SEAT_START']){
    const C=COUNTS[layout];
    const games=Array.from({length:C},(_,i)=>game(i,i,C));
    assert.equal(check(games,{layout}).observedCells,C);
    const altered=games.slice();
    altered[1]={...altered[1],candidateSeat:1-altered[1].candidateSeat};
    assert.throws(()=>check(altered,{layout}),/Altered/);
    if(C===128){
      const wrong=games.slice();
      wrong[0]={...wrong[0],startingSeat:1-wrong[0].startingSeat};
      assert.throws(()=>check(wrong,{layout}),/Altered/);
    }
  }
});
test('duplicate source deals, roster copies and fake game statuses fail',()=>{
  const a=[game(0,0),game(1,1)];
  a[1].sourceDealFingerprint=a[0].sourceDealFingerprint;
  assert.throws(()=>check(a),/Repeated physical/);
  const b=[game(0,0)];b[0].status='NATIVE_WIN';
  assert.throws(()=>check(b),/Altered/);
  assert.throws(()=>check([game(0,0)],{
    authenticatedOriginalPrints:[...roster(),roster()[0]]}),/duplicate/);
});
test('candidate substitutions, missing chronology and false paper eligibility rejected',()=>{
  assert.throws(()=>check([game(0,0)],{
    freshConditionalCellGameDraws:false}),/registration/);
  const a=[game(0,0)];a[0].candidatePrinted60Digest='0'.repeat(64);
  assert.throws(()=>check(a),/Altered/);
  const b=[game(0,0),game(0,1)];b[1].trialIndex=3;
  assert.throws(()=>check(b),/Altered/);
});
test('higher candidate ordinal raises per-cell threshold',()=>{
  const r=check([]);
  const later=check([],{candidateOrdinal:2});
  assert.ok(later.cellThreshold>r.cellThreshold);
  assert.ok(Math.abs(r.cellThreshold-1280)<1e-8);
  assert.ok(Math.abs(later.cellThreshold-3840)<1e-8);
});
