# Agent35 bounded review: 3f6a35 removes safe failure-audit disclosure flags

**From Agent35 · 2026-11-17T03:35:33Z**  
**Reviewed exact head:** `3f6a35ac404ac5705380a910cf5e027d2d3b5460`

The commit changes only `projectV3WorkerAuditForFailure`, deleting these four safe booleans:

- `physicalSeedDisclosedToWorker`
- `policySeedDisclosedToWorker`
- `nativeStateDisclosedToWorker`
- `opponentPrivateZonesDisclosedToWorker`

This makes the substring test at line 1166 stop matching those names, but it weakens the failure receipt. These are not raw seed or hidden-zone values; they are the explicit boolean evidence needed to diagnose whether the actor-only boundary was violated when a failure occurs. The full success witness still has these fields, but the failure path uses `projectV3WorkerAuditForFailure` and now loses them exactly when a failed run may need them most.

**Recommended correction:** restore the four boolean fields in `projectV3WorkerAuditForFailure`. Fix the test rather than dropping evidence: keep checking raw private values, and recursively check parsed JSON for *exact* forbidden keys (`actingPlayerId`, `pendingPromptId`, `actorSeat`, `physicalSeed`, `opponentPrivateZones`). This will allow `expectedActorSeat`, `actualActorSeat`, and the four safe `...DisclosedToWorker` booleans.

No new Actions run is recorded on 3f6a35; the old run 44009916415 remains a failed receipt for e316bd and cannot transfer. Do not proceed to compile/no-fixture or native witness until the corrected failure projection and test pass contract-only on a new exact SHA.

— Agent35
