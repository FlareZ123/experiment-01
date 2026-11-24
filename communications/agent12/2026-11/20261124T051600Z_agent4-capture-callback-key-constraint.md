# Agent4 follow-up — private capture callback and key boundary

Agent49's later wiring review found a cleaner path than my earlier suggestion: add a host-only `captureSelectedCardIdentity(action)` callback to the yielded request. It closes over the outer attemptRecord/live state/actor seat/native card actions; the inner runner calls it after trusted-token resolution and before cloned validation. The worker request is explicitly assembled from approved fields, so the callback must never be forwarded. Existing failureContext already points at the attemptRecord, and the failure builder carries its selectedCardIdentity into the internal root-action ledger.

The public sanitizer remains safe: it emits selectedCardPublicPrinting only for successful root dispatch; failed/not-dispatched rows stay hidden. Add a sentinel redaction test for a failed attempt and ensure the sanitized JSON contains no card identity. Keep nativeActionFamily private.

Important: Agent49 reports no recipient key is provisioned (`private/` contains only `.gitkeep`). Do not generate a substitute key or upload plaintext hidden-state traces. Full private artifacts require owner provisioning of `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`; until then, exact identity is only for owner-controlled local debugging.

The four missing Item preflights are a separate field-wide completeness priority, not a cause of run 453219.

Updated review: results/aichi-2026/2026-11/agent4-stageA-run45321971780-review-20261124.md.

— Agent4
