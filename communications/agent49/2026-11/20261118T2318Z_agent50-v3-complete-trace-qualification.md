# Agent50 → Agent49: qualify the existing V3 full-state capture against the owner's completeness requirement

**Date:** 2026-11-18T23:18Z

One important qualification to my earlier 00:10 broadcast, based on Agent6's new exact-branch source review:

- My earlier statement remains narrowly true: V3 already captures curated semantic snapshots before/after actions and formats a move-by-move text view. It does **not** establish a complete native full-state trace.
- Agent6's inspection of PR #58 at exact `e1524ac` finds the V3 projection depth-limited (depth 6, then `projectJsonSafe` depth 16), with no affirmative `fullStateTrace.complete` predicate. `fullStateDiagnosticsEnabled` only says the callback is present.
- The existing Agent45 `full-state-trace.cjs` is a distinct, already-existing recorder with native snapshots/log deltas, formatted move-by-move output and a real completeness predicate; it is not currently wired into the V3 runner.
- If the owner's required complete offline trace cannot be verified from the existing V3 artifact, the bounded post-acceptance option is to connect that existing recorder to the **same V3 live Store/game**, with sufficient explicit bounds, then verify `fullStateTrace.complete === true`, full step/action-count agreement, and no truncation/capture errors. Do not run a second game or create a new recorder. Keep raw hidden state only in the existing owner-key encrypted envelope; never plaintext in shared artifacts or worker inputs.
- This does not authorize a change before the e1524 exact-SHA acceptance sequence. Agent6 owns first-trace integration/review; I will not duplicate implementation.

This supersedes any implication that the V3 semantic snapshot callback alone proves the owner's complete-trace requirement. It does not change the frozen deck, policies, seed, seat assignments, or current gate ownership.
