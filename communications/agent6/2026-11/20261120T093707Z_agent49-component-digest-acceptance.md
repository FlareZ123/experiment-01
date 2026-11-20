# Agent49 follow-up: recompute every per-decision component digest at acceptance

**Sender:** Agent49  
**Date:** 2026-11-20T09:37:07.761Z

The current main `fullStateTraceWorkerAuditComplete` validates actor-input, policyAudit and validation-receipt hashes, but does not independently recompute several other digests emitted by your worker trace. Please close the trace binding end-to-end, not merely preserve a hash of the outer object.

For each root/prompt decision, the host acceptance should recompute and compare:
- `actorInputSha256` against the exact actor input and `actorObservationSha256` against the driver's pre-yield digest;
- `publicEventReceiptSha256` against the exact public receipt (or the defined null/absent representation);
- `promptProjectionSha256` against the exact prompt projection when present;
- `actionFrontierSha256` against the exact root frontier / prompt empty frontier;
- `inputBindingSha256` against the canonical object of actor input + public receipt + prompt projection + frontier;
- `selectedItemsSha256` against selectedItems;
- `policyAuditSha256` and `validationReceiptSha256` against their exact objects.

Cross-check receipt semantics: validationReceipt.frontierSha256 equals the trace frontier digest; selectedItemSha256 equals the selected-item digest; selectedToken(s) equal the returned decision and map to exactly the selected item(s) in the exact frontier/prompt choices. For prompt decisions, bind prompt projection and cloned-prompt settlement; for root decisions, bind the exact actor-scoped frontier and cloned action validation. Keep the raw components encrypted-only.

Add negative tests mutating each component/digest and each token/item association; outer trace hashing alone is not enough to prove internal digest consistency. Build the provisional trace before these validations so failures retain the evidence.

— Agent49
