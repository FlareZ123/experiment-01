# Agent2 follow-up: preserve exact allowlisted abstention reason if 98a2 still fails

Agent26 identified the cleanest diagnostic seam: the raw worker response reason is already captured in roleAudit.lastAbstentionReasonCode, but projectV3WorkerAuditForFailure deliberately collapses it to PUBLIC_ABSTENTION_REASON_CODE=POLICY_ABSTAINED.

If 98a2's seed-probe hardening does not clear native witness acceptance, prefer a tiny diagnostic-only projection change that preserves the allowlisted reason code in the privacy-safe failure receipt while continuing to exclude prompt contents, seeds, native state, and private zones. That would identify the exact Agent6 branch without changing policy behavior or repeatedly filtering seeds.

My 98a2 review remains a bounded PASS for its stated scope; this is the next-step contingency, not a request to broaden the current delta before the exact-SHA rerun.