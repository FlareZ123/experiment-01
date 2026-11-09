'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  rootLedger, joinReceiptLedger, runV8NativePaperCapture
} = require('../../simulation/evaluation/agent36-v8-native-paper-root-capture.cjs');

test('abort-preserved native root tape is a valid identity joining source',()=>{
  const row = {nativeAbortEvidence: {
    rootActionLedger: [{actionOrdinal:0, playerSlot:1, turnBefore:2,
      action:'PlayCardAction'}]
  }};
  assert.equal(rootLedger(row).length,1);
  const receipt={settledPhysicalIdentityClean:true,receipts:[{
    actionOrdinal:0,seat:1,turnBefore:2,action:'PlayCardAction'
  }]};
  assert.deepEqual(joinReceiptLedger(receipt,row),{
    status:'EXACT_ROOT_IDENTITY_JOIN',nativeRootCount:1,
    capturedStoreRootCount:1,firstMismatch:null,
    allPhysicalReferencesSettled:true
  });
  assert.equal(joinReceiptLedger(receipt,{}).status,'NO_NATIVE_ROOT_LEDGER');
  assert.equal(joinReceiptLedger(null,row).status,'NO_LIVE_STORE_CAPTURE');
});

test('wrong seat or action and incomplete actual Store tape fail closed',()=>{
  const native={rootActionLedger:[{
    actionOrdinal:0,playerSlot:1,turnBefore:2,action:'PlayCardAction'
  }]};
  const base={settledPhysicalIdentityClean:false,receipts:[{
    actionOrdinal:0,seat:0,turnBefore:2,action:'PlayCardAction'
  }]};
  assert.equal(joinReceiptLedger(base,native).status,'ROOT_IDENTITY_MISMATCH');
  assert.equal(joinReceiptLedger({...base,receipts:[]},native).status,
    'ROOT_COUNT_MISMATCH');
});

test('end-to-end callback-injected steward produces matched native roots',()=>{
  const makeCards=seat=>Array.from({length:60},(_,i)=>({
    fullName:'Print '+seat+'-'+i
  }));
  const makePlayer=seat=>({id:seat, deck:{cards:makeCards(seat)},
    hand:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},
    prizes:Array.from({length:6},()=>({cards:[]})),
    active:{cards:[],tools:[]},bench:[]});
  const steward=({runner})=>{
    const result=runner({});
    return {manifest:{version:'test-v8',
      originalSourceRegistration:'fixture',
      observedTwinleafGitCommit:'dummy',
      resolvedSourceAndPolicyHashes:[]},
    diagnostic:{registered:['trialA'],actualAttemptRows:[{id:'trialA'}]},
    rawDevelopment:result};
  };
  const runner=callbacks=>{
    const store={state:{players:[makePlayer(0),makePlayer(1)],
      phase:'PLAYER_TURN',turn:1,activePlayer:0,prompts:[]},
    dispatch(action){return action;}};
    callbacks.onRootStoreCreated(store,'trialA');
    const action={};
    store.dispatch(action);
    callbacks.onRootActionDispatched(store,action,0,0,1);
    return {rows:[{trial:{id:'trialA'},sourceSeat:1,candidateSeat:0,
      rootActionLedger:[{actionOrdinal:0,playerSlot:0,turnBefore:1,
        action:'Object'}]}]};
  };
  const result=runV8NativePaperCapture({steward,runner});
  assert.equal(result.expectedNativeAttempts,1);
  assert.equal(result.actualNativeAttempts,1);
  assert.equal(result.matchingExactNativeStoreRootTapes,1);
  assert.equal(result.captured[0].storeRaw.originalPhysicalCards.length,120);
  assert.equal(result.captured[0].join.status,'EXACT_ROOT_IDENTITY_JOIN');
  assert.equal(result.independentlyQualifiedGames,0);
  assert.equal(result.paperPaymentReviewPassed,false);
});
