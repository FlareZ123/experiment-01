'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,registeredSourceFieldPairs}=
  require('../simulation/evaluation/agent46-original-source-field-pair-bridge.cjs');
const {anytimePairedFieldDelta}=
  require('../simulation/evaluation/agent46-anytime-paired-field-delta.cjs');

const referenceId='champion-reference';
const challengerId='new-moon-lockbreaker-v1';
const digest='a'.repeat(64);

/** @param {number} rank @param {0|1} seat @param {string} id */
function pair(rank,seat,id){
  return {pairId:id,roundId:'round-0',rank,candidateSeat:seat,
    originalSourcePrintDigest:'b'.repeat(64),
    referenceTrialId:'reference-'+id,challengerTrialId:'challenger-'+id};
}
/** @param {ReturnType<typeof pair>} registration */
function arms(registration){
  return [
    {trialId:registration.referenceTrialId,candidateId:referenceId,
      candidateSeat:registration.candidateSeat,sourceDealFingerprint:digest,
      verifiedFirstTurn:true,nativeWinnerSeat:registration.candidateSeat,
      finished:true,qualifiesForCompetitiveInference:true},
    {trialId:registration.challengerTrialId,candidateId:challengerId,
      candidateSeat:registration.candidateSeat,sourceDealFingerprint:digest,
      verifiedFirstTurn:true,nativeWinnerSeat:registration.candidateSeat,
      finished:true,qualifiesForCompetitiveInference:true}
  ];
}
/** @param {ReturnType<typeof pair>} p */
function admitted(p){
  return [{rank:p.rank,printed60Sha256:p.originalSourcePrintDigest,physicalCards:60}];
}
/** @param {ReturnType<typeof pair>[]} registration @param {object[]} observations @param {object} [opts] */
function check(registration,observations,opts={}){
  return registeredSourceFieldPairs({referenceId,challengerId,layout:'RANK',
    registration,observations,...opts});
}

test('zero registered attempts preserve all 32 untested opponent cells',()=>{
  const r=check([],[]);
  assert.equal(VERSION,'agent46-original-source-attempts-to-field-pairs-v1');
  assert.equal(r.cells.length,32);
  assert.equal(r.registeredPairs,0);
  assert.equal(r.observedArms,0);
  assert.equal(r.competitiveQualified,false);
  assert.equal(anytimePairedFieldDelta({candidateOrdinal:1,cells:r.cells})
    .decision,'INSUFFICIENT_INFORMATION');
});

test('native engine winners and self-claimed competitive flags stay censored',()=>{
  const p=pair(6,0,'aichi-rank6-seat0');
  const output=check([p],arms(p));
  assert.equal(output.registeredPairs,1);
  assert.equal(output.matchedSourcePairs,1);
  assert.equal(output.cells[5][0].referenceStatus,'CENSORED');
  assert.equal(output.cells[5][0].challengerStatus,'CENSORED');
  assert.equal(output.competitiveQualified,false);
});

test('both original rank6 physical seats are accounted for without inventing wins',()=>{
  const a=pair(6,0,'aichi-rank6-seat0');
  const b=pair(6,1,'aichi-rank6-seat1');
  const d=check([a,b],[...arms(a),...arms(b)]);
  assert.equal(d.registeredArms,4);
  assert.equal(d.matchedSourcePairs,2);
  assert.equal(d.cells[5].length,2);
  assert.equal(d.cells.reduce((sum,row)=>sum+row.length,0),2);
  assert.equal(anytimePairedFieldDelta({candidateOrdinal:1,cells:d.cells})
    .decision,'INSUFFICIENT_INFORMATION');
});

test('missing observed arm remains registered and contributes full uncertainty',()=>{
  const p=pair(6,0,'missing-challenger');
  const d=check([p],[arms(p)[0]]);
  assert.equal(d.missingArms,1);
  assert.equal(d.observedArms,1);
  assert.equal(d.matchedSourcePairs,0);
  const f=anytimePairedFieldDelta({candidateOrdinal:1,cells:d.cells});
  assert.equal(f.unmatchedPairs,1);
  assert.equal(f.registeredPairs,1);
  assert.equal(f.intervals[5].observedLower,-1);
  assert.equal(f.intervals[5].observedUpper,1);
});

test('different source setup cannot silently become favorable matched contrast',()=>{
  const p=pair(6,1,'shifted-source');
  const observed=arms(p);
  observed[1].sourceDealFingerprint='b'.repeat(64);
  const d=check([p],observed,{authenticatedOriginalPrints:admitted(p),
    qualify:()=> 'QUALIFIED_WIN'});
  assert.equal(d.matchedSourcePairs,0);
  assert.equal(anytimePairedFieldDelta({candidateOrdinal:1,cells:d.cells}).unmatchedPairs,1);
});

test('independent qualification callback is explicit, never inferred',()=>{
  const p=pair(1,0,'hypothetical-complete');
  const d=check([p],arms(p),{
    authenticatedOriginalPrints:admitted(p),
    qualify:arm=>arm.candidateId===challengerId?
      'QUALIFIED_WIN':'QUALIFIED_NONWIN'
  });
  assert.equal(d.cells[0][0].referenceStatus,'QUALIFIED_NONWIN');
  assert.equal(d.cells[0][0].challengerStatus,'QUALIFIED_WIN');
  assert.equal(d.competitiveQualified,false);
  const f=anytimePairedFieldDelta({candidateOrdinal:1,cells:d.cells});
  assert.equal(f.registeredPairs,1);
  assert.equal(f.decision,'INSUFFICIENT_INFORMATION');
});

test('unknown paper qualification labels fail closed',()=>{
  const p=pair(6,0,'invalid-qualifier');
  assert.throws(()=>check([p],arms(p),{
    authenticatedOriginalPrints:admitted(p),qualify:()=> 'NATIVE_ENGINE_WIN'}),
    /Independent auditor/);
});

test('64 rank-seat and 128 rank-seat-start positions reflect registration',()=>{
  const p=pair(32,1,'last-rank-last-seat');
  const d=check([p],arms(p),{layout:'RANK_SEAT'});
  assert.equal(d.cells.length,64);
  assert.equal(d.cells[63].length,1);
  assert.equal(d.cells[62].length,0);
  p.startingSeat=1;
  const observed=arms(p).map(row=>({...row,actualStarterSeat:1}));
  const x=check([p],observed,{layout:'RANK_SEAT_START'});
  assert.equal(x.cells.length,128);
  assert.equal(x.cells[127].length,1);
  const invalid=check([p],arms(p),{layout:'RANK_SEAT_START'});
  assert.equal(invalid.invalidSourceReceipts,2);
  assert.equal(invalid.matchedSourcePairs,0);
});

test('missing first-turn receipt invalidates source pairing and qualified label',()=>{
  const p=pair(8,0,'bad-receipt');
  const observed=arms(p);
  observed[0].verifiedFirstTurn=false;
  const r=check([p],observed,{
    authenticatedOriginalPrints:admitted(p),qualify:()=> 'QUALIFIED_WIN'});
  assert.equal(r.invalidSourceReceipts,1);
  assert.equal(r.matchedSourcePairs,0);
  assert.equal(r.cells[7][0].referenceStatus,'CENSORED');
});

test('duplicate or unregistered observed arms and malformed registration fail',()=>{
  const p=pair(6,0,'duplicate');
  assert.throws(()=>check([p],[...arms(p),arms(p)[0]]),/Unregistered, duplicate/);
  assert.throws(()=>check([p],[...arms(p),{...arms(p)[0],trialId:'other'}]),
    /Unregistered, duplicate/);
  assert.throws(()=>check([p,p],arms(p)),/Duplicate or malformed/);
  assert.throws(()=>check([{...p,rank:33}],arms(p)),/Duplicate or malformed/);
  assert.throws(()=>check([p],arms(p),{layout:'bad'}),/Expected distinct/);
});

test('copying a different candidate ID is forbidden',()=>{
  const p=pair(2,1,'wrong-deck');
  const observed=arms(p);
  observed[1].candidateId='hood-shadow-rider-v1';
  assert.throws(()=>check([p],observed),/misidentified observed/);
});

test('missing original printed 60 forbids qualified game promotion',()=>{
  const p=pair(25,0,'no-original-25');
  const withCallback={qualify:()=> 'QUALIFIED_WIN'};
  assert.throws(()=>check([p],arms(p),withCallback),/Expected distinct fixed/);
  const d=check([p],arms(p),{
    authenticatedOriginalPrints:admitted(pair(6,0,'known-rank6')),
    ...withCallback
  });
  assert.equal(d.unadmittedOriginalPrintPairs,1);
  assert.equal(d.cells[24][0].referenceStatus,'CENSORED');
  assert.equal(d.cells[24][0].challengerStatus,'CENSORED');
  assert.equal(d.matchedSourcePairs,1);
});

test('wrong original 60 digest and invalid roster refuse paper qualification',()=>{
  const p=pair(6,0,'wrong-printing');
  const wrong=[{rank:6,printed60Sha256:'a'.repeat(64),physicalCards:60}];
  const d=check([p],arms(p),{
    authenticatedOriginalPrints:wrong,qualify:()=> 'QUALIFIED_WIN'
  });
  assert.equal(d.unadmittedOriginalPrintPairs,1);
  assert.equal(d.cells[5][0].challengerStatus,'CENSORED');
  assert.throws(()=>check([p],arms(p),{
    authenticatedOriginalPrints:[...admitted(p),...admitted(p)]
  }),/Invalid or repeated/);
  assert.throws(()=>check([p],arms(p),{
    authenticatedOriginalPrints:[{rank:6,printed60Sha256:'a',physicalCards:60}]
  }),/Invalid or repeated/);
});
