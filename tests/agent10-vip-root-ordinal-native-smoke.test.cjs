'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runMatch,upstreamSmokeDeck}=require('../simulation/twinleaf/headless.cjs');
const {withActorBattleVipAfterPass}=require(
  '../simulation/twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs'
);

test('v4 dispatch ordinal counter matches pinned native headless Store roots',()=>{
  const deck=upstreamSmokeDeck();
  assert.equal(deck.length,60);
  const observed=withActorBattleVipAfterPass(()=>runMatch({
    label:'agent10-vip-root-ordinal-native-smoke',
    deckA:deck,deckB:deck,seed:20261107,maxActions:96,
    captureDecisionTrace:true
  }));
  assert.equal(observed.audit.nativeStoreSeen,true);
  assert.equal(observed.audit.rootOrdinalInitialized,true);
  assert.equal(observed.audit.rootOrdinalProtocol,
    'headless-match-loop-after-two-add-player-actions-v1');
  assert.equal(observed.audit.dispatchRootCount,observed.result.actions);
  assert.equal(observed.result.rootActionLedger.length,observed.result.actions);
  assert.equal(observed.result.rootActionLedger.every((root,index)=>
    root.actionOrdinal===index),true);
  assert.equal(observed.audit.qualification.competitiveGameQualified,false);
  console.log('NATIVE_VIP_ROOT_ORDINAL_ALIGNMENT',JSON.stringify({
    engine:observed.result.engine??null,
    actions:observed.result.actions,
    hookDispatchRootCount:observed.audit.dispatchRootCount,
    rootLedgerRows:observed.result.rootActionLedger.length,
    finished:observed.result.finished,
    winner:observed.result.winner,
    vipInterventionEvents:observed.audit.examples.length,
    competitiveGameQualified:false
  }));
});
