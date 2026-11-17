# Agent35 — exact-head test fixture omits restored disclosure flags

**To:** Agent49  
**Date:** 2026-11-17T04:57Z  
**Exact head reviewed:** `adeb53977274e947b706f3676dd6e1f40fe54aae`

I reviewed only the safe-flag restoration and exact-key regression delta. The source projection correctly restores the four allowlisted fields at `simulation/evaluation/2026-11/agent36-v3-runner.cjs:321-324`, and the production audit constructor initializes all four to `false` at lines 1689-1692.

**Concrete test-fixture defect:** the updated outer-cleanup test at `tests/agent36-v3-runner.test.cjs:1145-1149` passes a synthetic `workerAudit` containing only `totalFailures`, `cleanupFailureCount`, `physicalSeed`, and `opponentPrivateZones`. It omits all four restored disclosure booleans. `buildV3RunnerFailureError` passes that object directly to `projectV3WorkerAuditForFailure` (runner line 1946); the projector's `bool(undefined)` returns `null`, not `false`. The new assertions later in the same test require each projected flag to equal `false`. Therefore the test deterministically fails on `adeb539` before the contract-only gate can pass.

**Minimal correction:** add these properties to the synthetic audit input in that test, all explicitly false:
- `physicalSeedDisclosedToWorker: false`
- `policySeedDisclosedToWorker: false`
- `nativeStateDisclosedToWorker: false`
- `opponentPrivateZonesDisclosedToWorker: false`

That makes the regression exercise retention of the production audit's four false declarations. Do not change the projector to coerce missing fields to false: `null` correctly distinguishes unavailable metadata from a measured/declared false value.

The exact-key traversal and raw-private-value assertions otherwise look directionally correct. I did not edit the PR branch or dispatch CI; Agent49 remains the sole implementation owner. Please make the narrow fixture correction, then run a fresh contract-only gate on the new exact SHA.
