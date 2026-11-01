'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {reconcileVoltCycloneRoot}=
  require('../simulation/evaluation/agent39-print-prompt-root-reconciliation.cjs');

const parent=(ordinal,turn,seat,attack='Volt Cyclone')=>
  ({actionOrdinal:ordinal,action:'AttackAction',attack,
    playerSlot:seat,turnBefore:turn});
const reply=(ordinal,turn,seat,parentOrdinal)=>
  ({actionOrdinal:ordinal,action:'ResolvePromptAction',
    pendingPrompt:'AttachEnergyPrompt',playerSlot:seat,turnBefore:turn,
    initiatingRootActionOrdinal:parentOrdinal});
const event=(turn,seat,storeScope='live')=>({
  turn,sourceSeat:seat,storeScope,
  family:'AttachEnergyPrompt',sourcePrinting:'Iron Thorns ex TWM',
  status:'PAPER_PROMPT_VERIFIED',nativeAccepted:true
});
const scene=(events,liveStoreObserved=true)=>({
  rootActionLedger:[
    parent(3,4,1),reply(4,4,1,3),
    parent(9,6,1),reply(10,6,1,9),
    parent(15,26,1),reply(16,26,1,15),
    parent(21,28,1),reply(22,28,1,21),
    parent(27,34,1),reply(28,34,1,27),
    // A separate candidate-owned non-source Energy prompt.
    parent(25,33,0,'Different Attack'),reply(26,33,0,25)
  ],
  paperPromptPortfolioAudit:{liveStoreObserved,events}
});

test('five distinct original-source roots match five live checks with auxiliary duplicates excluded',()=>{
  const sceneData=scene([4,6,26,28,34].flatMap(t=>
    [event(t,1,'auxiliary'),event(t,1,'live')]));
  const observed=reconcileVoltCycloneRoot(sceneData,1);
  assert.equal(observed.status,'LIVE_PRINTED_SOURCE_PROMPTS_MATCHED');
  assert.equal(observed.genuineAcceptedOriginalSourceVoltRoots,5);
  assert.equal(observed.liveCheckedSourceVoltReplies,5);
  assert.equal(observed.checkedOtherStoreOrUnattributedEvents,5);
  assert.equal(observed.rawAllStoreVerifiedEvents,10);
  assert.equal(observed.paperPromptRootDenominatorReconciled,true);
  assert.equal(observed.competitiveQualifiedGames,0);
});

test('the same ten raw events cannot certify five roots without live identity',()=>{
  const src=scene([4,6,26,28,34].flatMap(t=>
    [event(t,1,'unattributed'),event(t,1,'unattributed')]),false);
  const out=reconcileVoltCycloneRoot(src,1);
  assert.equal(out.status,'LIVE_STORE_UNOBSERVED');
  assert.equal(out.paperPromptRootDenominatorReconciled,false);
  assert.equal(out.rawAllStoreVerifiedEvents,10);
  assert.equal(out.liveCheckedSourceVoltReplies,0);
});

test('a duplicate live event or missing live event fails root reconciliation',()=>{
  const src=scene([4,6,26,28,34].map(t=>event(t,1)));
  src.paperPromptPortfolioAudit.events.push(event(4,1));
  const result=reconcileVoltCycloneRoot(src,1);
  assert.equal(result.status,'LIVE_ROOT_RECONCILIATION_MISMATCH');
  assert.equal(result.liveCheckedSourceVoltReplies,6);
  assert.equal(result.genuineAcceptedOriginalSourceVoltRoots,5);
});

test('a different printed parent attack or opposing seat cannot establish source coverage',()=>{
  const src=scene([4,6,26,28,34].map(t=>event(t,1)));
  src.rootActionLedger[0].attack='Another Attack';
  const result=reconcileVoltCycloneRoot(src,1);
  assert.equal(result.status,'LIVE_ROOT_RECONCILIATION_MISMATCH');
  assert.equal(result.genuineAcceptedOriginalSourceVoltRoots,4);
  assert.equal(result.liveCheckedSourceVoltReplies,5);
});

test('unexposed source is reported separately from verified original transfer',()=>{
  const src=scene([]);
  assert.equal(reconcileVoltCycloneRoot(src,0).status,
    'NO_SOURCE_VOLT_PROMPTS');
  assert.equal(reconcileVoltCycloneRoot(src,0)
    .paperPromptRootDenominatorReconciled,false);
});
