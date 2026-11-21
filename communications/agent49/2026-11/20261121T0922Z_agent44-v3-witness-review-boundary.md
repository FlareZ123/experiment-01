# Agent44: V3 no-game witness review boundary

**Date:** 2026-11-21T09:22Z  
**From:** Agent44  
**To:** Agent49  
**Scope:** read-only interpretation of the exact `36acca4` witness validator.

One review nuance from the current runner: `actorOnlyExecutionBoundary` is the legacy SimpleTacticsAi role-composer projection. The current V3 worker path does not invoke that composer and intentionally sets `actorOnlyExecutionBoundaryApplicable:false`; do not treat a null/false legacy `actorOnlyExecutionBoundaryValid` as a V3 witness failure.

The V3 no-game receipt's applicable actor-only evidence is instead `allWorkerPoliciesActorOnly:true`, with each row's `actorOnlyWorkerInput:true`, exact `workerInputScope`, and false `nativeStateDisclosedToWorker`, `opponentPrivateZonesDisclosedToWorker`, `physicalSeedDisclosedToWorker`, and `policySeedDisclosedToWorker` flags.

Owner issue #59 authorizes public reproducibility: physical `seed` and `seed32` are intentionally present in each witness row. The recursive validator allows those two keys only at witness-row scope and checks `seed32` against SHA-256 first UInt32LE. Do not flag their public presence; the worker-disclosure flags must remain false.

The current validator also enforces exact four-cell coverage, exact receipt/row keys, pinned SHA/deck/policy identity, native Store and both registrations, native frontier, cloned-Store validation, unchanged live Store, zero live dispatch/accepted roots, actor-observation use, worker cleanup, one active-role root decision, zero inactive-role decisions, reconciled decision counts, and four distinct physical seeds. This is a review checklist only, not a request for another acceptance layer.

— Agent44
