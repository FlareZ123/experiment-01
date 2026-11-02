'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const test=require('node:test');
const {sourceFirstLiveTurnHand,firstRecordedSourceDecisionPhase}=
  require('../simulation/evaluation/agent41-first-live-source-hand.cjs');

/** Native-shaped setup choice, mulligan bonus, first-turn owner roots. */
const trace=[
  {actionOrdinal:4,turnBefore:0,playerSlot:0,
    action:'ResolvePromptAction',cardSelection:{promptKind:'ChooseCardsPrompt'},
    decisionHandBefore:{ownHandPrintings:['Trubbish CRI','Boost Shake EVS']}},
  {actionOrdinal:9,turnBefore:0,playerSlot:0,
    action:'ResolvePromptAction',cardSelection:{promptKind:'ChooseCardsPrompt'},
    decisionHandBefore:{ownHandPrintings:['Trubbish CRI','Boost Shake EVS',
      'Muscle Band XY']}},
  {actionOrdinal:16,turnBefore:2,playerSlot:0,
    action:'PlayCardAction',card:'Muscle Band',
    decisionHandBefore:{ownHandPrintings:['Boost Shake EVS','Muscle Band XY',
      'Darkness Energy MEE','Quick Ball FST']}},
  {actionOrdinal:17,turnBefore:2,playerSlot:0,
    action:'PlayCardAction',card:'Boost Shake',
    decisionHandBefore:{ownHandPrintings:['Boost Shake EVS',
      'Darkness Energy MEE','Quick Ball FST']}},
  {actionOrdinal:23,turnBefore:2,playerSlot:1,
    action:'PassTurnAction',decisionHandBefore:{ownHandPrintings:['Other']}}
];

test('actual setup ChooseCardsPrompt is first historical source decision',()=>{
  assert.deepEqual(firstRecordedSourceDecisionPhase(trace,0),{
    status:'SETUP_PHASE',turn:0,actionOrdinal:4});
  const stale=trace.find(row=>row.playerSlot===0&&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  assert.equal(stale.actionOrdinal,4);
});

test('source going second hashes first actual playing-turn root, not setup',()=>{
  const result=sourceFirstLiveTurnHand(trace,0,1);
  assert.equal(result.turn,2);
  assert.equal(result.actionOrdinal,16);
  assert.equal(result.action,'PlayCardAction');
  assert.equal(result.ownerHandSize,4);
  assert.equal(result.status,'FIRST_LIVE_HAND_OBSERVED');
  assert.equal(result.sha256,createHash('sha256').update(
    JSON.stringify(['Boost Shake EVS','Muscle Band XY',
      'Darkness Energy MEE','Quick Ball FST'])).digest('hex'));
  assert.equal(result.paperOpportunityCertified,false);
});

test('source going first can capture actual turn1 before first card play',()=>{
  const result=sourceFirstLiveTurnHand([
    ...trace,{actionOrdinal:6,turnBefore:1,playerSlot:0,
      action:'PassTurnAction',decisionHandBefore:{ownHandPrintings:['Foo']}}
  ],0,0);
  assert.equal(result.actionOrdinal,6);
  assert.equal(result.turn,1);
  assert.equal(result.ownerHandSize,1);
});

test('no first live owner card choice preserves unknown without fallback',()=>{
  const result=sourceFirstLiveTurnHand(trace,1,1);
  assert.equal(result.status,'FIRST_LIVE_HAND_UNOBSERVED');
  assert.equal(result.ownerHandSize,null);
  assert.equal(result.sha256,null);
});

test('setup-only trace never fabricates first owner turn',()=>{
  const only=trace.slice(0,2);
  const old=firstRecordedSourceDecisionPhase(only,0);
  assert.equal(old.status,'SETUP_PHASE');
  const fresh=sourceFirstLiveTurnHand(only,0,1);
  assert.equal(fresh.status,'FIRST_LIVE_HAND_UNOBSERVED');
});

test('malformed traces fail rather than infer a digest',()=>{
  assert.throws(()=>sourceFirstLiveTurnHand(null,0,1),TypeError);
  assert.throws(()=>sourceFirstLiveTurnHand([],2,0),TypeError);
  assert.throws(()=>firstRecordedSourceDecisionPhase({},0),TypeError);
});
