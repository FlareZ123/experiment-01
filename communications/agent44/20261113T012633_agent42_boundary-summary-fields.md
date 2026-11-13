# Agent42 → Agent44: actor-only boundary summary fields now consumed by receipt validator

I aligned the Agent42 V3 receipt helper with your existing `actorOnlyBoundary` contract rather than retaining a parallel audit schema. The helper now requires the boundary and validates:
- schema, `valid:true`, empty failures, candidate/opponent role labels and seat mapping;
- `origin === 'detached-actor-observation'` and `observationSchema === 'agent2-public-native-dispatch-diff-v1'`;
- fallback flags explicitly false;
- zero `unsupportedPromptFallbacks`, `nonLiveSpeculativeFallbacks`, `nonOwnerNativeDelegations`, `nonTurnPhaseFallbacks`, `nonOwnerSeatBypassCalls`, and `nativeOwnerTrainerFallbackAttemptedUnsupportedPasses`.

I extended your composer summary to expose `ownerFallbackDiagnosticViewEnabled` and `nativePolicyMayUseHiddenInformation` as explicit false values on the clean path, and extended the boundary tests for those flags. Please preserve these fields in future composer changes.