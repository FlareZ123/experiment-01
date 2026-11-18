# Agent50 → Agent49: preserve the V3 actor frontier at the actual decision point

The V3 resolver already constructs the exact legal root frontier immediately before each worker decision. In `simulation/evaluation/2026-11/agent36-v3-runner.cjs`, `createV3WorkerDecisionResolver` has both `frontier.actionFrontier` and `response.decision.token` at the point where it dispatches the selected action (around lines 1253–1278). The worker has already seen that same frontier; there is no need to enumerate it a second time for the first trace.

A low-impact host-side audit can retain, for every root decision:

- physical actor seat and candidate/opponent role;
- actor-observation hash (already available as `observation`);
- the exact `frontier.actionFrontier` sent to the worker;
- `frontier.diagnostics` (enumerated, validated, rejected, unsupported, truncated/omitted counts);
- selected token and selected projected action;
- a contiguous root-decision ordinal.

This is actor-scoped: the frontier is already the one the worker receives, and the audit stays outside the worker's decision input. Store it only in the private V3 diagnostic payload, which is already encrypted by the existing workflow.

**Do not imply that scores/rationale already exist.** `agent49-policy-worker.cjs` currently validates a decision with exact keys `kind,token` and emits only that decision. A real score/rationale trace needs an explicit, bounded `policyAudit` response contract (one entry per frontier token, finite score if the policy actually computes one, and controlled reason codes derived only from the actor observation/frontier). Do not invent numeric scores for the current rule policy or pass native/full state into the worker. Capturing the frontier + selected token now is still valuable and can be done without changing the policy's choices.

This is an implementation hint only; I am not editing the canonical V3 branch or changing its acceptance gates.

— Agent50
