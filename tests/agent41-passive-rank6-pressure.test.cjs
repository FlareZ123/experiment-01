'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rank6PassivePressureEvidence}=require(
  '../simulation/evaluation/agent41-passive-rank6-pressure.cjs');

const roots=[
  {playerSlot:0,turnBefore:1,action:'PassTurnAction',actionOrdinal:3},
  {playerSlot:1,turnBefore:2,action:'PlayCardAction',
    actionOrdinal:8,card:'Field Blower'},
  {playerSlot:0,turnBefore:3,action:'PlayCardAction',
    actionOrdinal:12,card:'Professor\'s Research'}
];
const snapshot=(turn,active,blocked=true,hasPower=true)=>({
  globalTurn:turn,actingSeat:turn===2?1:0,
  sourceActiveIronThornsEx:active,
  targetPrinting:hasPower?'Mewtwo & Mew-GX UNM':null,
  targetPowerName:hasPower?'Perfection':null,
  targetNativeAbilityBlocked:hasPower?blocked:null
});
const makeAudit=()=>({
  schema:'agent39-sourcefirst-native-initialization-boundaries-v1',
  sourceSeat:0,candidateSeat:1,
  sourceTurn1:snapshot(1,true),candidateTurn2:snapshot(2,true),
  sourceReturnTurn3:snapshot(3,true)
});
const context={sourceSeat:0,candidateSeat:1,sourceActuallyFirst:true};
const evidence=(audit=makeAudit(),r=roots,c=context)=>
  rank6PassivePressureEvidence(audit,r,c);

test('passive printed suppression and rooted reply are observable, never an attack cause',()=>{
  const e=evidence();
  assert.equal(e.status,'native-capability-suppression-with-rooted-turn-continuity');
  assert.equal(e.pressureKind,'passive-ability-suppression');
  assert.equal(e.nativeCapabilitySuppressed,true);
  assert.equal(e.rootedReplyAndReturn,true);
  assert.equal(e.sourceTurnOneEndRoot.action,'PassTurnAction');
  assert.equal(e.candidateTurnTwoFirstRoot.card,'Field Blower');
  assert.equal(e.sourceTurnThreeFirstRoot.turn,3);
  assert.equal(e.passiveAbilityCausedBySourceRoot,false);
  assert.equal(e.actualTacticalOpportunityDenied,false);
  assert.equal(e.competitiveGameQualified,false);
});

test('source-second or missing turn-one Pass cannot be promoted to first-turn pressure',()=>{
  assert.equal(evidence(makeAudit(),roots,
    {...context,sourceActuallyFirst:false}).status,'source-was-not-first');
  assert.equal(evidence(makeAudit(),roots.slice(1)).status,
    'source-turn-one-boundary-unverified');
});

test('visible no-target and printed-Power exemption are separate negatives',()=>{
  const noTarget=makeAudit();
  noTarget.candidateTurn2=snapshot(2,true,true,false);
  assert.equal(evidence(noTarget).status,'no-eligible-visible-power');
  assert.equal(evidence(noTarget).nativeCapabilitySuppressed,false);
  const exempt=makeAudit();
  exempt.candidateTurn2=snapshot(2,true,false);
  assert.equal(evidence(exempt).status,'native-printed-power-block-unverified');
  assert.equal(evidence(exempt).nativeCapabilitySuppressed,false);
});

test('source Iron Thorns moved from Active to Bench is a pressure absence',()=>{
  const lost=makeAudit();
  lost.candidateTurn2=snapshot(2,false);
  const e=evidence(lost);
  assert.equal(e.status,'source-active-lock-continuity-absent');
  assert.equal(e.nativeCapabilitySuppressed,false);
});

test('source return and candidate first nonprompt roots must actually exist',()=>{
  const absent=evidence(makeAudit(),roots.slice(0,2));
  assert.equal(absent.status,'source-return-or-reply-unverified');
  assert.equal(absent.nativeCapabilitySuppressed,true);
  assert.equal(absent.rootedReplyAndReturn,false);
  const promptOnly=[roots[0],
    {...roots[1],action:'ResolvePromptAction'},roots[2]];
  assert.equal(evidence(makeAudit(),promptOnly).status,
    'candidate-turn-two-boundary-unverified');
});

test('reject incorrect native actor seats even if turns and target appear valid',()=>{
  const wrong=makeAudit();
  wrong.candidateTurn2.actingSeat=0;
  const result=evidence(wrong);
  assert.equal(result.observedBoundaryActors,false);
  assert.equal(result.nativeCapabilitySuppressed,false);
  assert.equal(result.status,'native-boundary-actor-mismatch');
});

test('reject fabricated chronology despite three matching turn-labelled roots',()=>{
  const reordered=roots.map(row=>({...row}));
  reordered[0].actionOrdinal=30;
  const result=evidence(makeAudit(),reordered);
  assert.equal(result.observedBoundaryActors,true);
  assert.equal(result.rootedReplyAndReturn,false);
  assert.equal(result.status,'source-return-or-reply-unverified');
  const invalid=roots.map(row=>({...row}));
  invalid[1].actionOrdinal=NaN;
  assert.equal(evidence(makeAudit(),invalid).rootedReplyAndReturn,false);
});

test('reject return snapshot from the candidate seat',()=>{
  const wrong=makeAudit();
  wrong.sourceReturnTurn3.actingSeat=1;
  const result=evidence(wrong);
  assert.equal(result.nativeCapabilitySuppressed,true);
  assert.equal(result.rootedReplyAndReturn,false);
  assert.equal(result.status,'source-return-or-reply-unverified');
});

test('reject mismatched source seat or observer provenance',()=>{
  assert.throws(()=>evidence({...makeAudit(),sourceSeat:1}),{
    name:'AssertionError'
  });
  assert.throws(()=>evidence({...makeAudit(),schema:'synthetic-lock'}),{
    name:'AssertionError'
  });
});
