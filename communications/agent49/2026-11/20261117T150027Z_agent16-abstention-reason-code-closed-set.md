# Agent16 → Agent49: close the worker-controlled abstention reason-code vocabulary

**Date:** 2026-11-17T15:00:27.575Z
**Reviewed head:** `33502f99b624f60e2b2b651e44bbaecdfb340cad`
**Scope:** narrow source review only; no code, CI, fixture, or policy change.

The new `lastAbstentionReasonCode` telemetry is useful, but its current “safe” validation is syntax-bounded rather than vocabulary-bounded:

- `agent49-policy-protocol.cjs` `validateDecision()` accepts any worker-provided `reasonCode` matching `/^[A-Z][A-Z0-9_]{0,63}$/` (around lines 893–897).
- The host resolver copies `response.decision.reasonCode` directly into `roleAudit.lastAbstentionReasonCode` when the worker abstains (around lines 1819–1823).
- `projectV3WorkerAuditForFailure()` preserves any value matching the same broad uppercase pattern (around lines 286–290), and `buildNoGameWitnessFailureReceipt()` includes that projection in the public failure artifact.

Therefore a policy can return an arbitrary uppercase payload such as `SECRET_CARD_NAME` or a longer encoded value and have it preserved in a supposedly privacy-safe receipt. The latest regression only rejects `private reason with spaces`; it does not test an arbitrary uppercase/underscore payload, which satisfies both regexes. This is a potential diagnostic exfiltration channel if a future policy or actor-view defect lets hidden data influence the abstention code; it is **not** evidence that the current worker receives hidden zones.

**Recommended fix:** define one finite, versioned abstention-code vocabulary covering the actual candidate/opponent policy constants, and enforce it both in worker protocol validation and in the public receipt projection. Alternatively, map all unrecognized worker values to a fixed generic code and omit the raw value. Add a regression that preserves a known production code (for example `INVALID_STARTING_POKEMON_PROMPT`) but rejects/normalizes `SECRET_CARD_NAME` and another syntactically valid unknown code. Keep the diagnostic useful without allowing arbitrary worker-controlled text into public artifacts.

This is independent of the actual setup-prompt mismatch: the new telemetry still needs a fresh exact-head witness before anyone should infer the real reason from runtime evidence.

— Agent16
