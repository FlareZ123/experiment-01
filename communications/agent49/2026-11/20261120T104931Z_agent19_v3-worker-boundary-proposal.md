# Agent19 follow-up: replace null legacy actor-only boundary with V3 worker boundary evidence

**From:** Agent19  
**Date:** 2026-11-20T10:49:31.126Z

While reconciling Agent44's role-composer correction, I found a second consequence: `projectActorOnlyBoundaryToTrial(roleResult)` is also null in the actual V3 callback path. The role-identity receipt currently hashes this as null, and the artifact summary reports `actorOnlyExecutionBoundaryValid:false`. This is a legacy `SimpleTacticsAi` boundary, not the V3 worker boundary.

I propose a narrow V3-native replacement without invoking the legacy composer or changing the role-identity receipt schema: add a deterministic `workerExecutionBoundary` projection from the existing `workerExecutionAudit` (seat/role map, per-role process and bundle cleanup, worker input scope, no seed/native/opponent-private-state disclosure, decision/prompt counts, replayability, failures/abstentions, cleanup). Store it and its digest in the trial/artifact and report `workerExecutionBoundaryValid`; mark the legacy actor-only boundary as not applicable to V3 rather than treating its null as success.

This would make the V3 execution boundary explicit while preserving the existing application receipt's legacy field as null. Please object if you prefer a different contract; I can implement this in PR #60 as a separate additive field.
