'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  assertNoDiagnosticFallbackFlags,
  inspectActorOnlyExecutionBoundary
}=require('../../simulation/twinleaf/agent44-role-scoped-policy-composition.cjs');

function audit(seat,overrides={}) {
  return {
    policyOwnerSeat:seat,
    version:'agent34-actor-only-root-policy-v1',
    origin:'detached-actor-observation',
    observationSchema:'agent2-public-native-dispatch-diff-v1',
    nativeOwnerTrainerFallback:undefined,
    unsupportedPromptFallbacks:0,
    nonLiveSpeculativeFallbacks:0,
    nonOwnerNativeDelegations:0,
    nonTurnPhaseFallbacks:0,
    nonOwnerSeatBypassCalls:0,
    ...overrides
  };
}

test('competitive role composition rejects diagnostic full-State fallback flags',()=>{
  assert.doesNotThrow(()=>assertNoDiagnosticFallbackFlags({},'commonDeps'));
  assert.doesNotThrow(()=>assertNoDiagnosticFallbackFlags({nativeOwnerTrainerFallback:false},'commonDeps'));
  assert.throws(()=>assertNoDiagnosticFallbackFlags({nativeOwnerTrainerFallback:true},'commonDeps'),/diagnostic-only/);
  assert.throws(()=>assertNoDiagnosticFallbackFlags({ownerFallbackDiagnosticView:true},'candidate options'),/diagnostic-only/);
});

test('both role audits must prove zero unsupported prompt and speculative-State fallbacks',()=>{
  const result=inspectActorOnlyExecutionBoundary({
    candidateAudit:audit(0),opponentAudit:audit(1),candidateSeat:0,opponentSeat:1
  });
  assert.equal(result.schema,'aichi-actor-only-execution-boundary-v1');
  assert.equal(result.valid,true);
  assert.deepEqual(result.failures,[]);
  assert.equal(result.candidate.unsupportedPromptFallbacks,0);
  assert.equal(result.opponent.nonLiveSpeculativeFallbacks,0);
});

test('native owner trainer fallback makes comparative execution boundary invalid',()=>{
  const result=inspectActorOnlyExecutionBoundary({
    candidateAudit:audit(0,{nativeOwnerTrainerFallback:{
      nativePolicyMayUseHiddenInformation:true,attemptedUnsupportedPasses:0
    }}),
    opponentAudit:audit(1),candidateSeat:0,opponentSeat:1
  });
  assert.equal(result.valid,false);
  assert.ok(result.failures.includes('candidate-native-owner-trainer-fallback-enabled'));
});

test('unsupported owner prompt fallback invalidates the role execution boundary',()=>{
  const result=inspectActorOnlyExecutionBoundary({
    candidateAudit:audit(0,{unsupportedPromptFallbacks:1}),
    opponentAudit:audit(1),candidateSeat:0,opponentSeat:1
  });
  assert.equal(result.valid,false);
  assert.ok(result.failures.includes('candidate-unsupportedPromptFallbacks-nonzero'));
});

test('speculative full-State delegation invalidates the role execution boundary',()=>{
  const result=inspectActorOnlyExecutionBoundary({
    candidateAudit:audit(0),
    opponentAudit:audit(1,{nonLiveSpeculativeFallbacks:2}),
    candidateSeat:0,opponentSeat:1
  });
  assert.equal(result.valid,false);
  assert.ok(result.failures.includes('opponent-nonLiveSpeculativeFallbacks-nonzero'));
});

test('non-owner native delegation and non-turn-phase fallback also fail closed',()=>{
  const nonOwner=inspectActorOnlyExecutionBoundary({
    candidateAudit:audit(0,{nonOwnerNativeDelegations:1}),opponentAudit:audit(1),
    candidateSeat:0,opponentSeat:1
  });
  assert.equal(nonOwner.valid,false);
  assert.ok(nonOwner.failures.includes('candidate-nonOwnerNativeDelegations-nonzero'));
  const nonTurn=inspectActorOnlyExecutionBoundary({
    candidateAudit:audit(0),opponentAudit:audit(1,{nonTurnPhaseFallbacks:1}),
    candidateSeat:0,opponentSeat:1
  });
  assert.equal(nonTurn.valid,false);
  assert.ok(nonTurn.failures.includes('opponent-nonTurnPhaseFallbacks-nonzero'));
});

test('non-owner seat bypass and unsupported fallback-pass counters fail closed',()=>{
  const bypass=inspectActorOnlyExecutionBoundary({
    candidateAudit:audit(0,{nonOwnerSeatBypassCalls:1}),opponentAudit:audit(1),
    candidateSeat:0,opponentSeat:1
  });
  assert.equal(bypass.valid,false);
  assert.ok(bypass.failures.includes('candidate-nonOwnerSeatBypassCalls-nonzero'));
  const fallback=inspectActorOnlyExecutionBoundary({
    candidateAudit:audit(0,{nativeOwnerTrainerFallback:{attemptedUnsupportedPasses:1}}),
    opponentAudit:audit(1),candidateSeat:0,opponentSeat:1
  });
  assert.equal(fallback.valid,false);
});

test('missing fallback counters and mismatched role seats fail closed',()=>{
  const result=inspectActorOnlyExecutionBoundary({
    candidateAudit:{policyOwnerSeat:0,version:'v1'},
    opponentAudit:audit(0),candidateSeat:0,opponentSeat:1
  });
  assert.equal(result.valid,false);
  assert.ok(result.failures.includes('candidate-unsupportedPromptFallbacks-missing-or-invalid'));
  assert.ok(result.failures.includes('candidate-nonLiveSpeculativeFallbacks-missing-or-invalid'));
  assert.ok(result.failures.includes('opponent-policy-owner-seat-mismatch'));
});
