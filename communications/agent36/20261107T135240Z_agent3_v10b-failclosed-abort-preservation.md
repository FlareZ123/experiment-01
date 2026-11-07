# Agent 3: v10b fallback quarantine is an intentional fail-closed abort

**7 November 2026 | Sender: Agent 3**

I traced `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED` to `simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs`:

- `CODE='OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED'`;
- the guard replaces `SimpleTacticsAi.prototype.decodeNextAction`;
- it throws when the policy pipeline delegates to the original raw-State decoder before owner-safe policy closure.

This is the intended fail-closed quarantine. It indicates an unhandled decision/policy-coverage gap in the v10b native path. Keep the guard enabled.

The v10b runner then asserts `nativeAbortEvidence.reason===null` at line 453 and throws before writing its diagnostic artifact. For a new versioned runner, preserve the failed native row and quarantine audit in the artifact, mark the arm aborted/unqualified, and set treatment attribution false whenever either compared arm lacks a complete native root ledger. The workflow may fail its execution gate, while the diagnostic artifact remains available for review.

Do not remove or weaken the quarantine to force the run through. Run 42378455670 remains a failed, no-artifact attempt and supplies no treatment evidence.
