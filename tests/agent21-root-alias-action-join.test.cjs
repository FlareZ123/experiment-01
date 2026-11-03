'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {reconcileBotPassToStoreRetreat}=
  require('../simulation/evaluation/agent21-root-alias-action-join.cjs');

const receipt={
  stage:'post-settlement',game:1,seat:0,turn:64,
  status:'EXACT_FEE_AND_PROMOTION',
  originalBotRootTagged:true,
  originalBotPassRootOrdinal:236,
  originalBotPolicyDecisionOrdinal:82
};
const root={
  actionOrdinal:236,turnBefore:64,turnAfter:64,
  playerSlot:0,action:'PassTurnAction',pendingPrompt:null,
  actorPolicyDecisionOrdinal:82
};
const trialRows=[{trial:{id:'5:1:B:champion-reference'},
  rootActionLedger:[root,{actionOrdinal:237,turnBefore:64,
    playerSlot:0,action:'AttackAction'}]}];

test('original typed Pass action object joins real settled physical fee',()=>{
  const r=reconcileBotPassToStoreRetreat(trialRows,{records:[receipt]});
  assert.equal(r.exactBotPassToStoreRetreatJoins,1);
  assert.equal(r.originalSelectedBotRootIdentityVerified,true);
  assert.equal(r.joins[0].status,
    'EXACT_BOT_ROOT_PASS_TO_PHYSICAL_PAID_RETREAT');
  assert.equal(r.qualifiedCompetitiveGames,0);
});

test('stale fee, unknown Store root and missing original action tag each fail',()=>{
  const variants=[
    {...receipt,status:'PHYSICAL_FEE_OR_POSITION_UNVERIFIED'},
    {...receipt,originalBotRootTagged:false},
    {...receipt,originalBotPassRootOrdinal:null},
    {...receipt,originalBotPassRootOrdinal:233},
    {...receipt,originalBotPolicyDecisionOrdinal:83},
    {...receipt,seat:1},
    {...receipt,turn:63}
  ];
  for(const modified of variants){
    const r=reconcileBotPassToStoreRetreat(trialRows,{records:[modified]});
    assert.equal(r.exactBotPassToStoreRetreatJoins,0,
      'Incorrectly certified '+JSON.stringify(modified));
    assert.equal(r.unsettledOrUnverified,1);
  }
});

test('two matching root ordinal entries are rejected, no ambiguous joins',()=>{
  const r=reconcileBotPassToStoreRetreat([
    {...trialRows[0],rootActionLedger:[root,{...root}]}
  ],{records:[receipt]});
  assert.equal(r.exactBotPassToStoreRetreatJoins,0);
});

test('genuine Pass without a fee receipt produces zero qualified matches',()=>{
  const r=reconcileBotPassToStoreRetreat(trialRows,{records:[]});
  assert.equal(r.receiptCount,0);
  assert.equal(r.originalSelectedBotRootIdentityVerified,false);
  assert.equal(r.exactBotPassToStoreRetreatJoins,0);
});
