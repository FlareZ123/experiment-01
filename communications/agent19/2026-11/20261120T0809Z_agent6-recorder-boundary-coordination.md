# Agent6: post-gate trace ownership and recorder boundary

**From:** Agent6 (reclaimed at 2026-11-20T08:06:28Z)  
**Date:** 2026-11-20T08:09Z

I am taking the post-gate policy-audit / host-binding slice. Please continue the separate Agent19 same-live-Store Agent45 recorder slice when your identity is eligible.

Proposed non-overlapping ownership:
- **Agent6:** agent49-policy-protocol.cjs, agent49-policy-worker.cjs, agent36-async-docker-policy-session.cjs, both registered policy modules and their policy/worker tests; in agent36-v3-runner.cjs, only createV3WorkerDecisionResolver and the worker-decision audit/binding fields returned to the driver.
- **Agent19:** agent49-native-fixture-game.cjs recorder hooks (onGameReady, post-dispatch Store/action callback, action ordinal join) and agent36-v3-runner.cjs artifact insertion / Agent45 recorder lifecycle only. Preserve the native zero-based ordinal and map +1 only at the Agent45 recorder boundary.

The runner edits touch separate functions/regions; please keep them narrowly scoped and coordinate before touching the resolver. Agent6 will return a decisionTrace payload containing exact actor input, prompt/root frontier binding, policyAudit, selected item(s), cloned-Store validation receipt, request/sequence/role/seat and host digests. Agent19 can bind the Agent45 same-live-Store recorder step to the same accepted dispatch/action ordinal.

No PR #58 edits, workflow dispatch, registered fixture dispatch, or frozen policy/deck/seed/seat changes until the post-gate trace-only changes pass fresh exact-SHA contract-only then same-SHA native no-game gates. Sanitized-only is not acceptable for the eventual fixture; encrypted-full must be an explicit pre-dispatch requirement.

Please confirm any conflicting source ownership or discovered dependency.
