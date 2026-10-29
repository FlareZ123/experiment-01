'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {pairedCensus,SCHEMA}=
  require('../simulation/evaluation/agent50-rank6-passive-32same-seed-replay.cjs');

/** @param {string} candidateId @returns {object} */
function row(candidateId){
  return {trial:{rank:6,repeat:0,seed:123,candidateSlot:'A',
    candidateId,id:'6:0:A:'+candidateId},
    candidateSeat:0,sourceActuallyFirst:true,
    sourceDealFingerprint:'same-source',
    fullPhysicalDealFingerprint:'same-full-physical-deal',
    candidateDeckFingerprint:'candidate-'+candidateId,
    sourceDeckFingerprint:'source-six',
    actualStarterSeat:1,rootActionLedgerSha256:'root-digest',
    rootActionCount:8,actionCount:18,turns:5,finished:false,
    verifiedFirstTurn:true,
    attackDeclarations:{source:0,candidate:1}};
}
test('classification preserves zero-attack passive suppression and no-target result',()=>{
  assert.equal(SCHEMA,'agent50-rank6-passive-unchanged-physical-deal-replay-v1');
  const a=row('champion-reference'),b=row('new-moon-lockbreaker-v1');
  const observed=[
    {...a,rank6PassivePressure:{
      status:'native-capability-suppression-with-rooted-turn-continuity',
      nativeCapabilitySuppressed:true,sourceActiveContinuity:true,
      examinedPrintedPowerCount:2,suppressedPowerName:'Underworld Door'}},
    {...b,rank6PassivePressure:{status:'no-eligible-visible-power',
      nativeCapabilitySuppressed:false,sourceActiveContinuity:true,
      examinedPrintedPowerCount:0,suppressedPowerName:null}}
  ];
  const result=pairedCensus({rows:[a,b]},{rows:observed});
  assert.equal(result.fullyNonInterfering,true);
  assert.equal(result.pairs.length,2);
  assert.deepEqual(result.pairs.map(x=>x.nativeCapabilitySuppressed),
    [true,false]);
  assert.deepEqual(result.pairs.map(x=>x.opponentAttackDeclarations),[0,0]);
  assert.equal(result.pairs[1].pressureStatus,'no-eligible-visible-power');
});
test('observer game-root mutation is flagged even if labels or outcome agree',()=>{
  const a=row('champion-reference');
  const b={...a,rootActionLedgerSha256:'changed-root-digest'};
  const out=pairedCensus({rows:[a]},{rows:[b]});
  assert.equal(out.fullyNonInterfering,false);
  assert.deepEqual(out.pairs[0].mismatchedKeys,['rootActionLedgerSha256']);
});
test('source card deal and error status stay hard invariants',()=>{
  const a=row('champion-reference');
  const b={...a,sourceDealFingerprint:'another-source',status:'engine-error'};
  const out=pairedCensus({rows:[a]},{rows:[b]});
  assert.equal(out.fullyNonInterfering,false);
  assert.ok(out.pairs[0].mismatchedKeys.includes('sourceDealFingerprint'));
  assert.ok(out.pairs[0].mismatchedKeys.includes('status'));
  assert.throws(()=>pairedCensus({rows:[a]},{rows:[]}),/Expected values to be strictly equal/);
});
