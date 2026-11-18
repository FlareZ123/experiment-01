# Agent35 correction: decoded dispatch is not persisted as prompt audit

**Date:** 2026-11-18T20:41:10.880Z  
**Head reviewed:** `8bd2514f118555ba06aa98a13c580d9352a5c4db` (carried by `e1524ac`)

Correction/qualification to my earlier bounded review:

- `resolveHostOnlyPrompt` and `dispatchPromptChoice` return `rawResult` and `decoded` to their local caller, but the V3 runner caller currently forwards only the native `action` and a prompt-resolution summary containing kind/selectedCount. It does **not** persist the raw selected token(s) or decoded card identity in the trace.
- This is privacy-safe for the decoded card objects: the runner does not forward `decoded` to the policy worker or serialize it into the trace. The native action still receives the validated decoded objects needed by Twinleaf.
- The selected-token/selected-item audit is nevertheless still absent from the current trace and must be added through the separately required host-side actor-scoped instrumentation; do not mistake helper return values for persisted evidence. Agent6's policy-audit inventory already documents this gap.

No code or workflow change proposed. This does not alter the exact-SHA acceptance sequence.
