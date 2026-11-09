'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {build,fromArchive,SCHEMA}=
  require('../../simulation/evaluation/2026-11/agent43-original-source-allroot-paper-worklist.cjs');
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

function trial(){
  const roots=[
    {actionOrdinal:0,turnBefore:0,turnAfter:0,playerSlot:0,
      action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt',
      initiatingRootActionOrdinal:null},
    {actionOrdinal:1,turnBefore:1,turnAfter:1,playerSlot:1,
      action:'PlayCardAction',card:'Fog Crystal',
      initiatingRootActionOrdinal:1},
    {actionOrdinal:2,turnBefore:2,turnAfter:2,playerSlot:0,
      action:'AttackAction',attack:'Cross Fusion Strike',
      initiatingRootActionOrdinal:2},
    {actionOrdinal:3,turnBefore:2,turnAfter:2,playerSlot:0,
      action:'ResolvePromptAction',pendingPrompt:'ChooseAttackPrompt',
      initiatingRootActionOrdinal:2},
    {actionOrdinal:4,turnBefore:2,turnAfter:3,playerSlot:0,
      action:'ResolvePromptAction',pendingPrompt:'WaitPrompt',
      initiatingRootActionOrdinal:2}
  ];
  return {
    trial:{id:'one-synthetic-case'},rootActionLedger:roots,
    rootActionLedgerSha256:sha(roots),
    sourceSeat:0,candidateSeat:1,sourceDealFingerprint:'source-physical',
    fullPhysicalDealFingerprint:'both-physical',
    nativeAcceptedTargetSidecar:{events:[{
      rootActionOrdinal:1,actionOrdinal:4,turnBefore:1,playerSlot:1,
      action:'PlayCardAction',storeAccepted:true,
      declared:{ownerHandPrinting:'Fog Crystal CRE'},publicBoardChanges:[]
    }]},
    nativePromptChoices:{events:[{
      ordinal:0,actorSeat:0,kind:'ChooseCardsPrompt',
      sourceZone:'hand',sourcePlayerSlot:0,
      selectedCards:['hidden-source-card']} ]},
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:2,turnBefore:2,triggerAction:'AttackAction',
      attackName:'Cross Fusion Strike',completionRootOrdinal:4,
      settledPromptChain:true,prizesBefore:[6,6],prizesAfter:[5,6]
    }]},
    candidateAttackSettlement:{attacks:[]},
    physicalZoneQualification:{physicalIntegrityQualified:false},
    finished:true,winner:0,finalPrizes:[5,6]
  };
}

const archive={phase:'P0S1',trialId:'one-synthetic-case'};

test('build preserves every actual root, actor, prompts and native evidence safely',()=>{
  const source=trial();
  const worklist=build(source,archive);
  assert.equal(worklist.schema,SCHEMA);
  assert.equal(worklist.totalAcceptedNativeRoots,5);
  assert.deepEqual(worklist.nativeSummary.actionCounts,
    {ResolvePromptAction:3,PlayCardAction:1,AttackAction:1});
  assert.equal(worklist.nativeSummary.observedNativeTargetActions,1);
  assert.equal(worklist.nativeSummary.observedNativePromptChoices,1);
  assert.equal(worklist.nativeSummary.observedNativeAttackSettlementAnchors,1);
  assert.equal(worklist.nativeSummary.sourceAttackPrizesTaken,1);
  assert.equal(worklist.nativeSummary.nativePhysicalIntegrityQualified,false);
  assert.equal(worklist.roots[1].targetNativeEvidence.declared.ownerHandPrinting,
    'Fog Crystal CRE');
  assert.equal(worklist.roots[1].ordinal,1);
  assert.equal(worklist.roots[0].ownerPromptNativeEvidence.selectionCount,1);
  assert.equal(worklist.roots[0].ownerPromptNativeEvidence.ownerPrivateRetrospectiveAuditOnly,true);
  assert.equal(JSON.stringify(worklist).includes('hidden-source-card'),false);
  assert.equal(worklist.roots[2].settledAttackNativeEvidence.completionRootOrdinal,4);
  assert.equal(worklist.reviews.competitiveGameQualified,false);
  assert.ok(worklist.roots.every(r=>r.paperReviewDisposition==='unreviewed' &&
    r.independentReceipt===null));
});

test('source archive lookup requires one exact registered trial in the selected phase',()=>{
  const obj={rawNativeRows:{P0S1:[trial()]}};
  assert.equal(fromArchive(obj,archive).totalAcceptedNativeRoots,5);
  assert.throws(()=>fromArchive(obj,{...archive,trialId:'other'}),/Exact registered/);
  assert.throws(()=>fromArchive({rawNativeRows:{P0S1:[trial(),trial()]}},archive),
    /Exact registered/);
});

test('ledger tampering fails the immutable SHA contract',()=>{
  const x=trial();
  x.rootActionLedger[1].card='Different';
  assert.throws(()=>build(x,archive),/Expected values to be strictly equal/);
});

test('target sidecar must reference actual native root, owner, action and turn',()=>{
  for(const mutate of [
    e=>{e.playerSlot=0;},
    e=>{e.action='AttackAction';},
    e=>{e.turnBefore=3;},
    e=>{e.storeAccepted=false;},
    e=>{e.rootActionOrdinal=8;}
  ]){
    const x=trial();mutate(x.nativeAcceptedTargetSidecar.events[0]);
    assert.throws(()=>build(x,archive));
  }
});

test('distinct native dispatch actionOrdinal cannot replace rootActionOrdinal',()=>{
  const x=trial();
  x.nativeAcceptedTargetSidecar.events[0].rootActionOrdinal=4;
  assert.throws(()=>build(x,archive));
});

test('owner prompt sidecar references only the exact owner prompt',()=>{
  for(const mutate of [
    e=>{e.ordinal=1;},
    e=>{e.actorSeat=1;},
    e=>{e.kind='ShuffleDeckPrompt';}
  ]){
    const x=trial();mutate(x.nativePromptChoices.events[0]);
    assert.throws(()=>build(x,archive));
  }
});

test('duplicate native-target and owner-prompt roots reject',()=>{
  for(const kind of ['target','prompt']){
    const x=trial();
    const events=kind==='target'?x.nativeAcceptedTargetSidecar.events:
      x.nativePromptChoices.events;
    events.push({...events[0]});
    assert.throws(()=>build(x,archive),/Duplicate native evidence root/);
  }
});

test('attack settlement must be real, anchored and completed within the tape',()=>{
  for(const mutate of [
    a=>{a.triggerAction='PlayCardAction';},
    a=>{a.settledPromptChain=false;},
    a=>{a.completionRootOrdinal=7;},
    a=>{a.turnBefore=1;}
  ]){
    const x=trial();mutate(x.sourceAttackSettlement.attacks[0]);
    assert.throws(()=>build(x,archive));
  }
});

test('noncontiguous or regressing accepted roots reject even when hashed anew',()=>{
  const x=trial();x.rootActionLedger[2].actionOrdinal=9;
  x.rootActionLedgerSha256=sha(x.rootActionLedger);
  assert.throws(()=>build(x,archive),/Noncontiguous/);
  const y=trial();y.rootActionLedger[2].turnBefore=0;
  y.rootActionLedgerSha256=sha(y.rootActionLedger);
  assert.throws(()=>build(y,archive),/Time regressed/);
});
