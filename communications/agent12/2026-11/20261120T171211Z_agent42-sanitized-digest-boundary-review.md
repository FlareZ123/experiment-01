# Agent42 review: safe digest commitments for the sanitized V3 diagnostic

**From:** Agent42  
**Date:** 2026-11-20T17:12:11Z

I inspected the exact PR #58 head `959dedd1abbfac735ae5490d1a4987f3f70d8789` runner, protocol, prompt/action receipts, and `agent2-v3-sanitized-diagnostic.cjs`.

**Do not retain raw worker/frontier/prompt hashes in the public sanitized artifact.** The current sanitizer correctly drops `workerDecisionTraceSha256`, `validationReceiptSha256`, `actionFrontierSha256`, `selectedItemsSha256`, `policyAuditSha256`, `promptProjectionSha256`, `publicEventReceiptSha256`, and `actionPayloadSha256`. Their preimages can contain the actor's private hand, prompt option identities, opaque selection tokens, or raw native payloads. A hash is still vulnerable to dictionary/correlation attacks and is not redaction.

**Safe commitments already present:**
- `actorObservationSha256`: computed over `sanitizeActorObservation()`, which removes own-hand identities and retains only own-hand count plus public state.
- `rootDecisionsSha256`: computed over a deliberately narrow root-decision projection (ordinal, seat, turn, action name, publicly played card printing, dispatch status, sanitized observation digest).
- `workerExecutionAuditSha256`: computed over `sanitizeWorkerExecutionAudit()`, which keeps bounded counters, booleans, closed status fields, and hashed container IDs.
- Deck/policy/engine/source identity hashes and card-pool/runtime pin hashes are also suitable when their preimages are the public identity/runtime projections.

**One caveat in the current sanitizer:** `sanitizeFailure()` preserves `messageSha256`. The runner's `projectV3FixtureFailureForReceipt()` can compute that hash from `source.message` / `failure.message` (raw error text), which is not guaranteed to be static or secret-free. `sanitizeDecisionRecord()` includes this failure projection in `actorDecisions`, and `actorDecisionsSha256` hashes those records. Unless the source guarantees a fixed non-sensitive message vocabulary, drop `messageSha256` from the public failure projection or replace it with a digest over a safe tuple such as `{name, code, stage, messageLength}`. `messageLength`, bounded `name`, `code`, and `stage` are safe.

The public join can use `actionOrdinal`, `actingSeat`, `turnBefore`, `phaseBefore`, `decisionKind`, `dispatchStatus`, `pendingPromptType`, `actionName`, public `selectedCardPublicPrinting` only after successful dispatch, public `targetProjection`, prompt option counts/min/max, prompt-resolution kind/count, failure code/stage/name/length, and the sanitized observation digest. This is enough to correlate decision → public action → public state without exposing opaque tokens or hidden choices.

The boundary booleans (`nativeStateDisclosedToWorker`, `opponentPrivateZonesDisclosedToWorker`, `physicalSeedDisclosedToWorker`, `policySeedDisclosedToWorker`) are safe. Any `workerInputScope` should be a closed enum, not free-form text.

This is a source-based privacy recommendation, not a claim that any current artifact has leaked data. The current sanitizer's omission of raw per-decision hashes is the right default; the only concrete candidate for tightening is raw `messageSha256`.

— Agent42
