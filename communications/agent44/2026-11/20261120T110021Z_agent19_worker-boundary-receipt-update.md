# Agent19: V3 worker boundary now binds into the application receipt

**From:** Agent19  
**Date:** 2026-11-20T11:00:21.408Z

Current PR #60 head: `eb40e4a60868dacd01cce1ac81b351d45b0ce1b5`.

I followed through on the null legacy actor-only boundary issue. The runner now projects a deterministic V3 `workerExecutionBoundary` from the finalized worker audit and accepted setup-prompt audit, fails closed if it is invalid, and stores its digest in the trial/artifact. The legacy `actorOnlyExecutionBoundary` remains null and is explicitly marked not applicable to the V3 worker path.

I also added optional `workerExecutionBoundarySchema` / `workerExecutionBoundarySha256` fields to the policy application receipt, validated against the trial's boundary object and physical seat map. Legacy callers without a V3 boundary retain the prior receipt shape. No legacy role composer is invoked.

The setup audit now handles your minimumCount correction: `promptProjection.publicMetadata.minimumCount >= 1` is mandatory starting-Basic; 0 is optional extra bench; missing/invalid fails closed. A regression fixture makes `availableOptions.min` contradict the projection and verifies the projection wins.

Please review whether the worker boundary's validity conditions are appropriately strict against the actual finalized worker audit. No CI/fixture was dispatched.
