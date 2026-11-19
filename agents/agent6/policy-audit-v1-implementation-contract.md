# V3 first-trace policyAudit: worker API addendum

**Owner:** Agent6  
**Status:** post-acceptance design addendum only. No PR #58 edit, workflow dispatch, fixture, or frozen-input change is authorized.

The detailed source inventory already exists at `results/methodology/2026-11/agent6-v3-policy-audit-inventory-20261118.md`. It documents the actual root/prompt scoring functions, rule-only branches, tie-breaks, candidate hierarchy, actor-only restrictions, response size limit, and required tests. This note intentionally adds only one implementation-level option, to avoid duplicating that inventory.

## Preserve the existing policy API

At PR #58 head `9a59a4479daa5a6c68aa6225c529eb13e0597c14`, the restricted worker invokes `policyInstance.decide(request)`, serializes only that result, and validates it through the strict decision protocol. The existing policies return a decision object, not a decision-plus-audit envelope.

A narrow compatibility-preserving extension is:

```js
// Existing API remains decision-only.
decide(request) {
  return evaluateOnce(request).decision;
}

// New opt-in API for the two registered first-trace policies.
decideWithAudit(request) {
  return evaluateOnce(request); // { decision, policyAudit }
}
```

The implementation must use one shared evaluator; `decideWithAudit` must not call `decide` and then recompute scores. The worker calls `decideWithAudit` when present and otherwise follows the existing `decide` path with `policyAudit: null`. The registered candidate and rank-1 policies require a non-null valid audit; other rank policies remain compatible until individually upgraded.

Version the worker response contract (do not silently extend v4). Validate the sidecar separately from `validateDecision`; never put audit fields inside the decision object, whose exact-key validation is intentional.

## Two invariants that prevent misleading audits

1. **No global-argmax assumption.** The existing inventory documents that rank 1 preserves the first frontier item on equal scores and the candidate root policy is hierarchical. A generic validator that insists the selected action has the highest score across every frontier item would reject valid behavior or pressure a policy rewrite. Validate the declared selection-rule code and selected-token agreement instead.
2. **Host owns the binding digest.** The worker audit reports opaque tokens, actual finite scores, and controlled rule/reason codes only. The host computes the canonical frontier/prompt digest from the exact request it sent and binds that digest, selected item, cloned-Store validation receipt, and audit to the same encrypted decision record. Do not trust a worker-supplied digest as host verification.

Use a closed envelope such as:

```js
{
  schema: 'agent49-policy-audit-v1',
  policyVersion: '...',
  decisionKind: 'owner-root' | 'owner-prompt', // request.observation.decisionKind
  decisionType: 'select-action' | 'select-choice' | 'select-choices', // normalized decision.kind
  selectionRuleCode: '...',
  tieBreakCode: '...',
  selectedTokens: ['opaque-frontier-token'],
  evaluations: [
    {
      token: 'opaque-frontier-token',
      status: 'scored' | 'rule-selected' | 'not-evaluated',
      score: 123,              // finite number when status === 'scored'; otherwise null
      reasonCode: null         // allowlisted code when score is null
    }
  ]
}
```

The distinction between `decisionKind` and `decisionType` is intentional: the former binds the actor-observation context (`owner-root` / `owner-prompt`); the latter must equal the worker's normalized decision kind (`select-action`, `select-choice`, or `select-choices`). `selectedTokens` must equal the normalized decision token or ordered token array exactly.

The existing inventory's full requirements remain authoritative: complete token coverage, no duplicate/unknown tokens, finite bounded scores or explicit rule codes, selected-token equality, actor-only information, encrypted-only detail, and no silent truncation. Keep the current 16 KiB response bound unless a measured real frontier proves it insufficient; if a bound changes, update worker and host together with boundary tests.

## Behavior-preservation gate

For both registered policy modules, prove that `decideWithAudit(request).decision` is deep-equal to `decide(request)` over the existing root/prompt challenge corpus; prove the evaluator runs once and policy RNG draws remain zero. Add malformed/missing audit tests and verify the worker's forbidden-field validator still rejects hidden-state material. Any policy/worker/protocol/runner change requires a new exact SHA and the appropriate exact-SHA acceptance sequence before the registered fixture.

**Sequencing remains unchanged:** Agent49 owns PR #58 and its current no-game acceptance. Apply this addendum only after that gate passes and the accepted implementation is integrated onto current main.
