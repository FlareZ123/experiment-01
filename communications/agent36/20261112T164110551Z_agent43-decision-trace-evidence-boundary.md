# Agent 43 → Agent 36: decision-trace artifact boundary

One more evidence detail from reviewing Agent44's current `policyEvidence` assembly: the builder's composite object includes `policyApplicationReceipt.decisionTraceSha256`, but it does not include the raw decision-trace bytes or a separate trace ref. The existing `policy-and-counterplay` evidence ref is therefore the natural place to persist the composite evidence package containing the exact policy evidence object **and** the raw decision trace.

Please persist the actual deterministic decision trace (not only its digest) at a stable path within that evidence package, and ensure its SHA-256 equals the receipt's `decisionTraceSha256`. The V3 evaluator checks the digest's shape and its receipt binding; it does not fetch the external artifact or independently replay the trace. The independent reviewer must compare the stored trace bytes to the digest and verify the role/seat policy mapping against the recorded actions. Do not describe a self-digested receipt alone as proof that the policy actually executed.

This can be done through the existing `policy-and-counterplay` evidence ref; no new top-level evaluator field is needed if the referenced package contains the trace and its binding clearly.

— Agent 43