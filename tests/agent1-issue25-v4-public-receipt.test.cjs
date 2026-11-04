'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {buildReceipt} =
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

const PATH =
  'simulation/evaluation/agent1-issue25-joined-two-seat-attacks-v4.cjs';

function execution(rawRows, attemptedRows) {
  return {
    manifest:{
      policyEntryPoint:PATH,actualRunnerConfirmedOption:true,
      originalSourceRankScriptsDisabledByOptIn:true,
      fullDecisionPolicySymmetryCertified:false
    },
    diagnostic:{
      registered:['rank6-a','rank11-b'],
      attemptedRows,
      registeredAttemptReconciliation:{exactUniqueMatch:true},
      rawRowIdentityReconciliation:{exactlyReconciled:true},
      allRegisteredAttemptsReturned:true,
      verdict:'FAIL-full-paper-owner-policy-and-match-admission-unproven',
      nightWatchSeedCommitmentSha256:'a'.repeat(64),
      sourceStampedFutureSight:{ownerPromptSelections:1},
      sourceStampedNightWatch:{acceptedDispatches:1}
    },
    rawDevelopment:{rows:rawRows}
  };
}

test('out-of-order native Store raw outcomes join by identity, preserve failure and censored arms',()=>{
  const rawRows=[
    {id:'rank11-b',status:'native-error',
      nativeAbortEvidence:{failureStage:'prompt',actionOrdinal:24},
      rootActionLedger:[{action:'PassTurnAction',playerSlot:1,turnBefore:2}]},
    {id:'rank6-a',status:'action-capped',
      policyAudit:{twoSeatVersion:'shared-v1'},
      rootActionLedger:[{action:'ResolvePromptAction',
        pendingPrompt:'WaitPrompt',playerSlot:0,turnBefore:1}]}
  ];
  const attemptedRows=[
    {id:'rank6-a',status:'action-capped',originalSourceSeat:0},
    {id:'rank11-b',status:'native-error',originalSourceSeat:1}
  ];
  const result=buildReceipt(execution(rawRows,attemptedRows));
  assert.deepEqual(result.registration.returnedIds,['rank6-a','rank11-b']);
  assert.equal(result.registration.exactJoinedByTrialId,true);
  assert.deepEqual(result.attempts.map(x=>x.rawDisposition),
    ['action-capped','native-error']);
  assert.deepEqual(result.developmentGate.originalSourcePhysicalSeatsSeen,[0,1]);
  assert.equal(result.developmentGate.resourcePolicyVersionObservedPerNativeRow,1);
  assert.equal(result.developmentGate.exactRegisteredReturn,true);
  assert.equal(result.developmentGate.competitiveGameQualified,false);
  assert.equal(result.qualifiedCompetitiveGames,0);
  assert.equal(result.developmentGate.overall,'FAIL-development-only');
});

test('duplicate native identity cannot silently satisfy four-arm qualification',()=>{
  const a={id:'rank6-a',rootActionLedger:[]};
  const result=buildReceipt(execution([a,{...a}],[
    {id:'rank6-a',status:'unknown',originalSourceSeat:0},
    {id:'rank11-b',status:'unknown',originalSourceSeat:1}
  ]));
  assert.equal(result.registration.exactJoinedByTrialId,false);
  assert.equal(result.developmentGate.exactRegisteredReturn,false);
  assert.equal(result.qualifiedCompetitiveGames,0);
});

test('unretrieved abort leaves native physical provenance unresolved',()=>{
  const result=buildReceipt(execution([],[
    {id:'rank6-a',status:'native-error',originalSourceSeat:null}
  ]));
  assert.equal(result.registration.exactJoinedByTrialId,false);
  assert.equal(result.attempts[0].publicRootActionCount,null);
  assert.equal(result.developmentGate.completePublicRootsAllArms,false);
  assert.equal(result.developmentGate.competitiveGameQualified,false);
});
