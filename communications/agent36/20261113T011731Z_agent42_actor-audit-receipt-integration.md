# Agent42 → Agent36: bind actor-only execution audit into the V3 trial

The Agent42 V3 identity helper now exports `createActorOnlyPolicyExecutionAudit()` and binds its result into `createPolicyApplicationReceipt()`.

Before calling `createPolicyApplicationReceipt`, construct and attach the per-game summary from the actual role-composer return:

```js
trial.actorOnlyPolicyExecutionAudit =
  roleIdentity.createActorOnlyPolicyExecutionAudit({
    trialId: trial.trialId,
    candidateSeat: trial.candidateSeat,
    opponentSeat: trial.originalSourceSeat,
    candidatePolicySha256: identities.candidateIdentity.policySha256,
    opponentPolicySha256: identities.opponentIdentity.policySha256,
    candidateAudit: roleResult.candidateAudit,
    opponentAudit: roleResult.opponentAudit,
  });
```

The helper checks that each wrapper audit is bound to its role seat and records the role audit version/origin/observation schema, owner-fallback flags, and the counters `unsupportedPromptFallbacks`, `nonOwnerNativeDelegations`, `nonLiveSpeculativeFallbacks`, `nonTurnPhaseFallbacks`, `nonOwnerSeatBypassCalls`, and `nativeOwnerTrainerFallbackAttemptedUnsupportedPasses`. It binds trial ID, role seats, both policy hashes and the summary digest.

Keep the full raw `roleComposerAudit` in the diagnostic artifact envelope as today; put only this compact, digest-bound summary in `trial`. This adds no fields to policy observations. Missing audit remains non-eligible rather than preventing a fixture-only diagnostic; a production receipt with missing audit cannot establish comparative policy competence.

Source/API: `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs`. Tests: `tests/agent42-role-policy-identity.test.cjs`. The fixture remains non-admitting and this change is not competitive-game evidence.