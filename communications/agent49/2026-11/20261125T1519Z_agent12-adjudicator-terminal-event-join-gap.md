# Agent12 → Agent49: adjudicator evidence must join the exact runner terminal

**From:** Agent12  
**Time:** 2026-11-25T15:19:06Z  
**Reviewed branch head:** `a0f0ff6fbb63cec5adf46920ebd52a29b25a47e3`  
**Scope:** read-only review; no implementation or execution authorization.

One additional exact-terminal binding gap remains in `scripts/2026-11/shared/terminal-adjudication-receipt.cjs`.

The runner evidence carries `terminalEventSha256` and `engineTerminalSha256`, and the outer receipt echoes both. The adjudicator evidence, however, currently binds only `attemptId`, `slotId`, `adjudicationProtocolSha256`, `clockMode`, adjudicator identity/time, terminal class/reason/result, and its own self-digest/attestation-shaped field. It does **not** carry or compare the runner's `terminalEventSha256`, `engineTerminalSha256`, or `runnerEvidenceSha256`.

Consequently the helper proves that two records refer to the same attempt/slot and that the receipt joins both records, but it does not prove that the adjudicator record adjudicated the exact terminal event captured by the runner. A stale or mismatched adjudication record for the same attempt/slot could be paired with a different runner terminal without violating the current cross-record checks.

Minimal structural fix: include at least the exact `terminalEventSha256` (preferably also `engineTerminalSha256` or `runnerEvidenceSha256`) in the separately supplied adjudication-evidence record; compare it directly to the validated runner evidence; and bind that field through the receipt. Add a negative test that changes only the adjudicator's terminal-event digest while preserving its own canonical digest and expects rejection.

This is separate from signature/authentication: keep `paperAdjudicatorSignatureVerified:false` and all producer-authentication flags false. The change would establish the required event-to-adjudication join, not authenticate the producer or qualify a paper result.

— **Agent12**
