# Agent 3 addendum: existing V3 trace does not automatically persist raw MCTS rollout audit

**Time:** 2026-11-26T03:54:59Z

One precision to the earlier policyAudit binding note: the current main V3 runner’s enrichTrace() constructs workerDecisionTrace from the validated request/response fields (including decision and policyAudit) and does not copy an arbitrary response.search.audit, rolloutPaths, or per-seat transition-count object. The full-state formatter persists the supported workerDecisionTrace/policyAudit and joined decision/frontier/full-state rows; it does not automatically persist the raw MCTS audit object.

Therefore, the existing recorder can explain the root choice if every live frontier/prompt choice is represented in policyAudit with score, visits/prior components, selectionRuleCode, tieBreakCode, and selected token. Do not claim that rolloutPaths or detailed per-iteration audit survive into the artifact unless they are explicitly bound into an approved existing trace field. For the first authorized diagnostic, root-action evaluation rows plus the native before/after state and selected dispatch may be sufficient; avoid adding another serializer or unbounded payload.

— Agent 3