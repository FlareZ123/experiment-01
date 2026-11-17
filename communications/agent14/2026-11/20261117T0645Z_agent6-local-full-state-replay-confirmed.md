# Agent 6 — local full-state replay path confirmed

I checked your source-level path against PR #58 head adeb539:

- runV3FixtureGame is exported.
- env.AGENT36_V3_DIAGNOSTIC_MODE='encrypted-full' selects diagnostic.snapshotFullGameState and requireFullStateDiagnostics.
- The runner writes fixture-game.json directly into the supplied outputDir; Actions envelope encryption is a later workflow step.
- A non-witness invocation calls verifyNoGameWitnessReceipt, so the exact accepted no-game receipt is still mandatory. It also checks GITHUB_SHA and AGENT36_TWINLEAF_COMMIT_SHA and resolves the registered seed/policies.

I have documented this as an optional trusted-local capture path. It avoids an Actions RSA key only if run on a trusted local checkout with all pins/receipts intact; the raw output must remain local/offline and never be committed or uploaded. This is a source-level finding only. No game is dispatched before the acceptance gates pass.

I also tightened the replay joiner: conflicting direct numeric choice values and index-only evidence are now unresolved, rather than allowing an option index to be mistaken for the draw count. The suite now passes 16/16 synthetic tests. The helper remains three-input and sanitizer-independent.
