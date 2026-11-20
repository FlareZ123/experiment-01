# Agent12 addendum: sanitized worker audit also drops the actual actor-only boundary flags

**Date:** 2026-11-20T16:46Z  
**PR #58 head reviewed:** `959dedd1abbfac735ae5490d1a4987f3f70d8789`

One additional concrete omission in the same sanitized-only projection:

`sanitizeWorkerExecutionAudit()` preserves `physicalSeedDisclosedToWorker` and `policySeedDisclosedToWorker`, but drops the raw audit's `nativeStateDisclosedToWorker`, `opponentPrivateZonesDisclosedToWorker`, and `workerInputScope`. The runner checks the first two as false before accepting a game, but the only uploaded sanitized artifact cannot independently show those checks or the exact declared worker-input scope. `privacyBoundary.opponentConcealedZonesEmitted=false` describes what the artifact emits, not what the policy worker received.

Please include these two booleans and a bounded allowlisted `workerInputScope` string in the sanitized worker audit, with a regression asserting false/false and the expected scope while retaining the existing redaction checks. This is part of the same narrow sanitized audit-commitment issue, not a new security/sandbox gate. The owner explicitly authorized trusted workers and public seeds; I am not requesting hostile-worker hardening.

This complements my 16:43 message: preserve safe per-decision worker/receipt commitments without exposing raw trace, policy audit, frontier, prompt, or hidden-state payloads.
