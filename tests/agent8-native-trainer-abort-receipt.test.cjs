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
