'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {assessNativeDecisionIntegrity}=require(
  '../simulation/twinleaf/agent38-native-proposal-state-smoke.cjs');

const game=(root,sha='matched-source')=>({
  firstTurnSlot:0,actions:root.length,rootActionLedger:root,
  initialSourceDealFingerprint:{digestSha256:sha}
});

test('identical native initial deal and Store roots prove observer noninterference',()=>{
  const roots=[{actionOrdinal:1,action:'ResolvePromptAction'},
    {actionOrdinal:2,action:'PlayCardAction',card:'Cynthia & Caitlin'}];
  const baseline=game(roots),observed=game(structuredClone(roots));
  const result=assessNativeDecisionIntegrity(baseline,observed,{
    calls:5,violations:[{ordinal:4,turn:2,changedGraph:{
      changedFields:1,examples:[{kind:'scalar-value',
        path:'state.players.1.supporterTurn'}]
    }}]
  });
  assert.equal(result.sameOriginalSourceDeal,true);
  assert.equal(result.sameActualStoreRootLedger,true);
  assert.equal(result.originalStateMutationsObserved,1);
  assert.equal(result.decisionCalls,5);
  assert.equal(result.criticRejectedProposalWitness,false);
  assert.equal(result.policyOutcomeQualified,false);
});

test('different physical source deal must not be treated as same root',()=>{
  const action=[{actionOrdinal:3,action:'PassTurnAction'}];
  const result=assessNativeDecisionIntegrity(game(action,'A'),game(action,'B'),{
    calls:1,violations:[]
  });
  assert.equal(result.sameOriginalSourceDeal,false);
  assert.equal(result.sameActualStoreRootLedger,true);
  assert.equal(result.originalStateMutationsObserved,0);
});

test('read-only instrumentation divergence must remain visible',()=>{
  const a=game([{actionOrdinal:4,action:'PlayCardAction'}]);
  const b=game([{actionOrdinal:4,action:'PassTurnAction'}]);
  const result=assessNativeDecisionIntegrity(a,b,{calls:2,violations:[]});
  assert.equal(result.sameOriginalSourceDeal,true);
  assert.equal(result.sameActualStoreRootLedger,false);
  assert.notEqual(result.baselineRootSha256,result.instrumentedRootSha256);
});

test('missing native source digest cannot qualify same-deal comparability',()=>{
  const x=game([{actionOrdinal:1,action:'PassTurnAction'}]);
  delete x.initialSourceDealFingerprint;
  const result=assessNativeDecisionIntegrity(x,x,{calls:1,violations:[]});
  assert.equal(result.sameOriginalSourceDeal,false);
});
