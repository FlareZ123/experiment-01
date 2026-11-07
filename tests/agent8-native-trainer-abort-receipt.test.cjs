'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {executionRow}=
  require('../simulation/evaluation/agent7-issue25-v3-executed-receipt.cjs');

test('abort root Trainer audit is preserved without exposing owner hand',()=>{
  const row=executionRow({id:'fixed-source-case',status:'engine-error'},{
    trial:{id:'fixed-source-case'},
    status:'engine-error',
    actorNativeTrainerFallbackAbortAudit:{
      schema:'actor-native-trainer-fallback-abort-v1',
      rootInstalled:true,attemptedUnsupportedPasses:2,
      selectedNativeTrainerRoots:0,acceptedNativeTrainerRoots:0,
      rejectedNativeTrainerRoots:0,declinedByReason:{}
    },
    nativeAbortEvidence:{rootActionLedger:[],rootActionCount:0}
  });
  assert.equal(row.actorNativeTrainerFallbackAbortAudit.rootInstalled,true);
  assert.equal(row.actorNativeTrainerFallbackAbortAudit.attemptedUnsupportedPasses,2);
  assert.equal(row.publicRootActionCount,0);
  assert.equal(row.nativeFailure,null);
  assert.equal(row.actorNativeTrainerFallbackAbortAudit.ownerHand,undefined);
});

test('historical and non-Trainer control rows have null fallback audit',()=>{
  const row=executionRow({id:'control',status:'nonterminal-unqualified'},{
    trial:{id:'control'},rootActionLedger:[]});
  assert.equal(row.actorNativeTrainerFallbackAbortAudit,null);
});


test('root fallback opt-in preserves aggregate evidence on an immediate error',()=>{
  const {withActorOnlyRootPolicy}=
    require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  class FakeAi { decodeNextAction(){return null;} }
  class FakeStore { dispatch(){return null;} }
  class PlayCardAction {}
  class AttackAction {}
  class PassTurnAction {}
  class RetreatAction {}
  class UseAbilityAction {}
  class UseStadiumAction {}
  const priorAi=Object.getOwnPropertyDescriptor(FakeAi.prototype,
    'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(FakeStore.prototype,
    'dispatch');
  const error=new Error('controlled-root-abort');
  assert.throws(()=>withActorOnlyRootPolicy(()=>{throw error;},{
    SimpleTacticsAi:FakeAi,Store:FakeStore,
    cardActions:{PlayCardAction,PlayerType:{},SlotType:{}},
    gameActions:{AttackAction,PassTurnAction,RetreatAction,
      UseAbilityAction,UseStadiumAction},
    getCatalog:()=>new Map(),
    nativeOwnerTrainerFallback:true
  }),e=>{
    assert.strictEqual(e,error);
    assert.equal(e.actorNativeTrainerFallbackAbortAudit.rootInstalled,true);
    assert.equal(e.actorNativeTrainerFallbackAbortAudit
      .attemptedUnsupportedPasses,0);
    assert.equal(e.actorNativeTrainerFallbackAbortAudit
      .acceptedNativeTrainerRoots,0);
    assert.equal(e.actorNativeTrainerFallbackAbortAudit.ownerHand,undefined);
    return true;
  });
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeAi.prototype,
    'decodeNextAction'),priorAi);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,
    'dispatch'),priorStore);
});
