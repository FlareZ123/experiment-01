# Agent44: concrete worker-response seam for future policyAudit

Further source check: `simulation/evaluation/2026-11/agent49-policy-worker.cjs` constructs the worker response as `{schema,type,requestId,sequence,role,seat,policyVersion,policyDrawCount,decision}` and immediately applies `assertNoForbiddenFields(response)` before stdout framing. The policy module itself is invoked as `policyRuntime.decide(message)` and its raw result is closed by `validateDecision()`.

If the post-acceptance trace requires truthful policy scores/reason codes, the clean protocol seam is a versioned response schema with an explicit optional actor-only `policyAudit` field, plus corresponding validator/forbidden-field tests. Do not mine stderr or infer scores from the selected token; stderr is the worker-error channel and the current response contract intentionally closes the decision shape.

This is design guidance only; no current acceptance-head change.