'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {sourceWitness,classifyActions,auditJointV2Archive} =
  require('../simulation/evaluation/agent41-joint-v2-archive-audit.cjs');
const A='a'.repeat(64),B='b'.repeat(64),C='c'.repeat(64);
const c={actionOrdinal:2,playerSlot:0,turnBefore:1,turnAfter:1,action:'PassTurnAction'};
const v={...c,action:'PlayCardAction',card:'Battle VIP Pass'};
const trial=(candidateId,id)=>({rank:5,repeat:1,candidateSlot:'B',seed:123,candidateId,id});
function rows(candidateId,id,mode,digest=A,abort=false) {
  const t=trial(candidateId,id);
  const native=abort?{
    trial:t,status:'engine-error',nativeAbortEvidence:{
      sourceDealFingerprint:{seat:1,digestSha256:digest},
      rootActionLedger:[c]
    },nativeSetupCoinChoiceReceipt:{firstSeatFromVerifiedDraw:1}
  }:{trial:t,rootActionLedger:mode==='control'?[c]:[v]};
  const summary={trialId:id,sourceSeat:1,physicalSourceDeal:abort?null:digest,
    actualStarterSeat:abort?null:1,nativeStatus:abort?'engine-error':null};
  return {native,summary};
}
function profile(ctrlRows,selRows){
  const mode=(id,entries)=>({id,rows:entries.map(x=>x.summary),
    native:{rows:entries.map(x=>x.native)}});
  return {schema:'agent23-selected-symmetric-joint-v2-native-source-audit-v1',
    modes:[mode('joint-v1-control',ctrlRows),mode('selected-v2-symmetric-vip',selRows)]};
}
test('exact first VIP after Pass uses same owner and root turn',()=>{
  const o=classifyActions({ledger:[c],abort:false},{ledger:[v],abort:false});
  assert.deepEqual(o,{kind:'SELECTED_VIP_INSTEAD_OF_PASS',index:0,firstActor:0,turn:1});
});
test('diagnostic ordinal may vary without action divergence',()=>{
  const a={...c,actorPolicyDecisionOrdinal:9};
  const b={...c,actorPolicyDecisionOrdinal:12};
  assert.equal(classifyActions({ledger:[a],abort:false},{ledger:[b],abort:false}).kind,'IDENTICAL_FULL');
});
test('native error sidecar recovers source physical custody without completion',()=>{
  const entry=rows('champion-reference','x','control',A,true);
  const observed=sourceWitness({trial:trial('champion-reference','x'),
    summary:entry.summary,native:entry.native});
  assert.equal(observed.digest,A);assert.equal(observed.sourceSeat,1);
  assert.equal(observed.starter,1);assert.equal(observed.abort,true);
});
test('native abort with identical accepted prefix remains explicitly aborted',()=>{
  assert.equal(classifyActions({ledger:[c],abort:true},{ledger:[c],abort:true}).kind,'IDENTICAL_UNTIL_ABORT');
});
test('two-axis audit keeps matching cross-mode custody and different candidate inventory distinct',()=>{
  const a='5:1:B:champion-reference',b='5:1:B:new-moon-lockbreaker-v1';
  const output=auditJointV2Archive(profile(
    [rows('champion-reference',a,'control',A),rows('new-moon-lockbreaker-v1',b,'control',B)],
    [rows('champion-reference',a,'selected',A),rows('new-moon-lockbreaker-v1',b,'selected',B)]));
  assert.equal(output.sourceMatchedAcrossModes,2);
  assert.equal(output.crossCandidateMatched,0);
  assert.equal(output.actionClassCounts.SELECTED_VIP_INSTEAD_OF_PASS,2);
  assert.equal(output.paperQualifiedGames,0);
});
test('cross-candidate equality is recoverable from an aborted sidecar but cannot settle the aborted game',()=>{
  const a='5:1:B:champion-reference',b='5:1:B:new-moon-lockbreaker-v1';
  const out=auditJointV2Archive(profile(
    [rows('champion-reference',a,'control',C,true),rows('new-moon-lockbreaker-v1',b,'control',C)],
    [rows('champion-reference',a,'selected',C,true),rows('new-moon-lockbreaker-v1',b,'selected',C)]));
  assert.equal(out.sourceMatchedAcrossModes,2);
  assert.equal(out.fullySettledMatchedAcrossModes,1);
  assert.equal(out.crossCandidateMatched,2);
  assert.equal(out.actionClassCounts.IDENTICAL_UNTIL_ABORT,1);
});
test('no original-source receipt cannot be certified as physical equality',()=>{
  const a='5:1:B:champion-reference',b='5:1:B:new-moon-lockbreaker-v1';
  const control=[rows('champion-reference',a,'control',A,true),
    rows('new-moon-lockbreaker-v1',b,'control',A)];
  const selected=[rows('champion-reference',a,'selected',A,true),
    rows('new-moon-lockbreaker-v1',b,'selected',A)];
  delete control[0].native.nativeAbortEvidence.sourceDealFingerprint;
  delete selected[0].native.nativeAbortEvidence.sourceDealFingerprint;
  const out=auditJointV2Archive(profile(control,selected));
  assert.equal(out.sourceMatchedAcrossModes,1);
  assert.equal(out.sourceUnknownAcrossModes,1);
  assert.equal(out.crossCandidateMatched,0);
  assert.equal(out.crossCandidateUnknown,2);
});
test('unexpected earlier action divergence is named and never silently called VIP',()=>{
  const o=classifyActions({ledger:[c],abort:false},
    {ledger:[{...v,card:'Quick Ball'}],abort:false});
  assert.equal(o.kind,'OTHER_FIRST_DIFFERENCE');
});
