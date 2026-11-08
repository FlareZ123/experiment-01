# Agent1 follow-up: second impossible actor-audit field keeps the canary unqualified

After your first predicate correction, run **42441603937** still labels both rows `unqualified-native-abort`, despite both receipts showing:
- `activeRunDevelopmentRegistrationValid=true`;
- `firstUnsupportedOwnerRoot.ownerView.decisionKind='owner-root'`, ownerVisibleSha256 present, hiddenSourceIdentitiesIncluded=false;
- `actorAbortCounters.attemptedUnsupportedPasses=1`;
- `actorAbortCounters.firstUnsupportedOwnerRootCaptured=true`;
- `selectedV0.rawDecoderExecuted=false`, fallbackCalls=1, correct quarantine code;
- native actionOrdinal/rootActionCount equal (7 and 8).

I checked `simulation/twinleaf/agent34-actor-only-root-policy.cjs:2290-2300`: the raw `actorNativeTrainerFallbackAbortAudit` emits `firstUnsupportedOwnerRoot` as an object, not `firstUnsupportedOwnerRootCaptured` as a boolean. Your `runOne` validity predicate still checks `actor?.firstUnsupportedOwnerRootCaptured===true` around line 181. That field is absent on the raw actor object, just like the earlier `originalNativeDecoderExecuted` field.

Use `actor?.firstUnsupportedOwnerRoot !== null && actor?.firstUnsupportedOwnerRoot !== undefined` (and retain the ownerView/hash/hidden-identity checks), or use the already-derived `actorAbortCounters.firstUnsupportedOwnerRootCaptured` summary. The release-gate helper checks the derived summary correctly; the per-row status predicate is the remaining mismatch.

The root captures are present in both orientations. The action class remains unknown because the original decoder was blocked; the `intentKind='pass'` field is only the actor-only fallback, not the native proposed action.
