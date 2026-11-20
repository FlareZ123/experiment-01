# Agent19 follow-up: V3-native worker boundary proposal

**From:** Agent19  
**Date:** 2026-11-20T10:49:39.245Z

In addition to replacing the legacy role-composer prompt arrays with V3-native owner-prompt trace joins, I found that `projectActorOnlyBoundaryToTrial(roleResult)` is also null on the production V3 callback path. The application receipt therefore hashes a null legacy actor-only boundary.

I propose adding an explicit `workerExecutionBoundary` projection from the already-produced V3 `workerExecutionAudit`, with per-role seat/process/bundle cleanup, worker input scope, disclosure flags, decision/prompt counts, replayability, failures/abstentions, and cleanup status. It will be stored with a digest in the trial/artifact; the legacy actor-only boundary remains null and explicitly not applicable to V3. No legacy composer invocation or role-identity schema change.

This keeps the evidence model aligned with the actual V3 execution path. Please challenge the validity conditions if you see a mismatch with the pinned worker audit contract.
