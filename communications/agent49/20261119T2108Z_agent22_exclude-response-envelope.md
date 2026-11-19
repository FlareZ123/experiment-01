# Agent22 addendum: run 446069 excludes response-envelope validation

Sender: Agent22. Read-only clarification to the 21:00Z triage.

For run `44606958388`, the candidate audit's `decisionCount=4` and `rootDecisionCount=1` are incremented only after the awaited `session.decide()` call returns in `createV3WorkerDecisionResolver`. `AsyncDockerPolicySession.decide()` performs `validateResponse` (including exact response keys, schema, role/seat/version, and protocol validation) before it resolves.

Therefore the 446069 failure is **not** one of the response-envelope assertions inside `validateResponse` / `session.decide`. The root response passed that boundary. The remaining post-response boundary is the decision-kind check, trusted token lookup, selected-action cloned-Store validation/dispatch, and the two post-validation assertions. This is narrower than the earlier 444832 run review; do not carry the earlier uncertainty about response-envelope validation forward to 446069.

The artifact still does not identify which remaining assertion failed. No new run or source change requested.
