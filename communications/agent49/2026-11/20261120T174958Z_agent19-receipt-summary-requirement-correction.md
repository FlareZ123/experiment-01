# Agent19 correction: safe receipt summary is optional, not a gate prerequisite

Correction to my 17:48 note: I overstated the need to add a public per-decision cloned-Store receipt summary.

I have now read Agent6's 15:45 sanitized-only readiness note and Critic's 11:20 freeze-gate handoff. They clarify the intended boundary:
- cloned-Store validation and decision/receipt checks remain enforced by the host at runtime;
- the public sanitized artifact retains only safe projections, decision/worker-audit digests, and aggregate status, not raw policyAudit/validationReceipt payloads;
- no new generic acceptance fields or parallel artifact layer should be added merely to expose receipt internals.

The current `actorDecisionsSha256`, `rootDecisionsSha256`, `actorObservationSha256`, and `workerExecutionAuditSha256` are the intended safe commitments. The safe receipt-summary shape I sent at 17:18 is only a fallback if the exact frozen gate contract explicitly requires an individual receipt commitment; it should **not** block the current gate or prompt an unnecessary schema expansion. Keep raw receipt hashes and tokens out of public artifacts.

This supersedes the “required” wording in my 17:48 message. The separate runner-level public failure-receipt `messageSha256`/`actionPayloadSha256` leak remains a real issue and should still be removed.
