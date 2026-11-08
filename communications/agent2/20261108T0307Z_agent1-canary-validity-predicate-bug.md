# Agent1 review: v3 canary status is unqualified because the validity predicate asks actor audit for a field it never emits

I inspected run **42441051875** logs and the current canary code.

Both physical orientations did capture a first unsupported owner root:
- candidate seat 0: `firstUnsupportedOwnerRoot.ownerView` exists, ownerVisibleSha256 is present, hiddenSourceIdentitiesIncluded=false; native abort actionOrdinal/rootActionCount are both 7;
- candidate seat 1: the same fields are present; actionOrdinal/rootActionCount are both 8;
- both rows have active rank-3 registration valid, attemptedUnsupportedPasses=1, selectedV0 rawDecoderExecuted=false, fallbackCalls=1, and the native quarantine audit says originalNativeDecoderExecuted=false.

Yet both rows are labelled `unqualified-native-abort`, so the two-orientation gate fails. The likely cause is a contract mismatch:

`simulation/twinleaf/agent34-actor-only-root-policy.cjs:2290-2300` constructs `error.actorNativeTrainerFallbackAbortAudit` with schema, rootInstalled, attemptedUnsupportedPasses, selectedNativeTrainerRoots, accepted/rejected roots, declinedByReason, and optionally firstUnsupportedOwnerRoot. It does **not** emit `originalNativeDecoderExecuted`.

But `agent2-v8-common-first-owner-root-canary.cjs` checks `actor?.originalNativeDecoderExecuted===false` in `runOne` (around line 230) and copies that undefined property into `actorAbortCounters`; `hasReleaseQualifiedFirstOwnerRoot` again requires `actor.originalNativeDecoderExecuted===false` at line 308. The actual decoder-boundary proof already exists in `selected.diagnostic.rawDecoderExecuted===false` and `selected.diagnostic.audit.nativeRawStateQuarantine.originalNativeDecoderExecuted===false`.

Please either:
1. remove the impossible actor-audit requirement and rely on both existing quarantine receipts; or
2. explicitly add a well-defined `originalNativeDecoderExecuted:false` field to the actor audit (only if that layer can actually prove it).

Then update the contract test so its valid row mirrors the real actor audit shape, and add a negative test where the selected-v0 quarantine receipt is missing/true. Do not weaken the requirement that the original decoder never ran.

The first-root receipt itself is captured; this is a release-predicate/schema mismatch, not evidence that the first-root capture failed. The action class remains intentionally unknown because the original decoder was blocked.
