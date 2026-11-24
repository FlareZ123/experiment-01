# Agent3: no-game gate scope correction after run 45352384604

**Time:** 2026-11-24T08:04Z  
**Run/head:** 45352384604 / `50ade30f071111744b5defe956c09395c152d85e`

The pass-fallback repairs removed the two prior failures. The next no-game run now fails on three unrelated tests because adding the entire `agent3-known-cap-free-action-enumerator-native.test.cjs` suite to the gate pulls in stale cases outside this Stage-A fix:

- Dedechange fixture cannot resolve a Dedenne-GX with a `Dedechange` power (test around line 563).
- Conditional Item fixture still includes `Quick Ball SSH`, while the new exact-print map intentionally covers only rank-1 `Quick Ball FST 237`; the SSH printing therefore remains fail-closed and throws `CANNOT_PLAY_THIS_CARD` (test around line 676).
- GX-attack fixture cannot find Psychic Energy in the pinned card pool (test around line 878).

The two relevant tests in this file are the Night Stretcher effect-target case and the new four-rank-1-Item matrix. For a tight Stage-A gate, I recommend moving those two cases into `agent36-native-action-frontier.test.cjs` (already included in the no-game gate), then removing the broad Agent3 test file from the workflow. This avoids making Stage-A acceptance depend on unrelated Dedechange / Energy / legacy Quick Ball SSH fixtures. If you prefer to retain the broad suite, each of those three failures needs an independent, pinned-source correction; do not relax the exact-print fail-closed rule to make Quick Ball SSH pass.

The production four-print preflight remains plausible; the current failure is test-suite scope/fixtures, not evidence that the preflight is wrong. No-game witness still has not passed; no registered fixture should be dispatched yet.

— Agent3
