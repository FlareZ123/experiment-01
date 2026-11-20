# Agent49 implementation aid: exact no-game witness field map

The combined canonical PR #58 head remains 23c5373d747bf817fbfdda5d63c365c36d4591ba. I inspected the actual receipt construction there; the allowlists should match these literal fields, not a broader generic projection.

Top-level receipt keys:
- schema, fixtureOnly, gameExecuted, liveActionsDispatched, allStoreStatesUnchanged, allSelectedActionsValidated, allActorObservationsUsed, allWorkersClosed, allWorkerPoliciesActorOnly, generatedAt, researchRevisionSha, twinleafCommitSha, candidatePrinted60Sha256, opponentPrinted60Sha256, candidatePolicySha256, opponentPolicySha256, candidatePolicyVersion, opponentPolicyVersion, coverage, witnesses.

Witness-row keys:
- fixtureOnly, gameExecuted, nativeStoreCreated, bothPlayersRegistered, nativeActionFrontierUsed, nativeValidationStoreMode, hostStoppedBeforeLiveDispatch, candidateSeat, opponentSeat, actorSeat, role, seed, seed32, actualFirstPlayerSeat, actorObservationUsed, selectedActionValidated, validationActionKind, actionFrontierItemCount, fullOriginalStoreStateUnchanged, liveActionDispatched, acceptedRootActions, rootDecisionCount, workerDecisionCount, policySha256, policyVersion, workerCleanupVerified, allWorkerSessionsClosed, actorOnlyWorkerInput, nativeStateDisclosedToWorker, opponentPrivateZonesDisclosedToWorker, physicalSeedDisclosedToWorker, policySeedDisclosedToWorker, workerInputScope, workerFailureCount, policyRngReplayable, candidatePolicySha256, opponentPolicySha256, candidatePolicyVersion, opponentPolicyVersion, researchRevisionSha, twinleafCommitSha, candidatePrinted60Sha256, opponentPrinted60Sha256, promptProvenanceHookRestored, runtimePinGuardRestored.

The existing successful unit fixture currently omits generatedAt and seed32, so update it to include both. The real seed32 derivation is implemented by normalizeSeed32 in simulation/evaluation/2026-11/agent49-native-fixture-game.cjs: for a string, SHA-256(seed UTF-8).readUInt32LE(0). Each of the four no-game witness rows has its own independent seed returned by findNoGameWitnessSeed; do not compare it with the registered full-game seed. Keep seed and seed32 allowed only at the exact witnesses[i] path. coverage should be the four cells 0:0, 0:1, 1:0, 1:1.

This is only a field map to reduce implementation ambiguity. Please keep the patch limited to exact-key/recursive validation and the associated positive/negative tests; no new gate or CI dispatch. Agent49 retains integration and dispatch.
