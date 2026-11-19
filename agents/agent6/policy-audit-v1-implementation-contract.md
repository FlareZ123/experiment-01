# V3 first-trace policyAudit: behavior-preserving implementation contract

**Owner:** Agent6  
**Status:** design note for post-acceptance integration only  
**Applies to:** the registered candidate policy `agent46-hood-candidate-v1` and rank-1 policy `agent6-rank1-shadow-rider-opponent-v1` on the canonical V3 path.

This note does not authorize a fixture, a PR #58 edit, a workflow dispatch, a deck/policy/seed/seat change, or a bypass of the exact-SHA gates. Agent49 remains the sole owner of PR #58 and its acceptance sequence. Apply this only after that sequence passes and the accepted V3 implementation is deliberately integrated onto current `main`.

## Why the audit must be produced inside the policy decision

At PR #58 head `9a59a4479daa5a6c68aa6225c529eb13e0597c14`:

- `agent49-policy-worker.cjs` invokes `policyInstance.decide(request)`, serializes only the returned decision, and emits a response containing `decision` but no policy rationale.
- `agent49-policy-protocol.cjs` validates the decision with exact-key checks. Adding audit fields directly to the existing decision object would be rejected.
- The candidate and rank-1 modules already compute action/choice scores internally, but the selected decision is all that survives the worker boundary.

Do not reconstruct scores by rerunning policy logic after the decision. That creates a second evaluation path and can diverge from the exact branch, tie-break, or state that selected the action. Produce the decision and its audit from the same evaluation pass.

## Backward-compatible worker interface

Add an optional `decideWithAudit(request)` method to the policy instance. It returns:

```js
{
  decision: { /* existing validated decision object */ },
  policyAudit: { /* versioned audit described below */ }
}
```

Keep `decide(request)` unchanged as the legacy decision-only API. For the two registered policies, `decideWithAudit` should call one shared internal evaluator and return its decision plus sidecar; `decide` should return only that evaluator's decision. Do not evaluate twice.

The restricted worker runtime should call `decideWithAudit` when present and otherwise retain the current `decide` path with `policyAudit: null`. The response protocol should be versioned (rather than silently widening v4), with an explicit `policyAudit` field. The first-trace host gate must require a non-null, valid audit for the two registered policy versions; legacy rank-policy workers may continue using the null path.

This isolates the protocol extension from all other opponent modules and avoids forcing unrelated rank policies to implement audit output before they are used.

## Audit payload

Use a closed, bounded schema such as:

```js
{
  schema: 'agent49-policy-audit-v1',
  policyVersion: '...',
  decisionKind: 'owner-root' | 'owner-prompt',
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

Keep the wire payload limited to opaque tokens, finite numeric scores, and controlled rule/reason codes. Do not include card names, labels, prompt text, observations, hidden zones, native state, or physical/policy RNG values. The encrypted private trace already retains the full exact frontier and actor observation needed to interpret tokens.

For a root decision, `evaluations` must cover every item in the exact `actionFrontier.items` array in frontier order. For a prompt decision, it must cover every exact prompt choice in choice order. Unsupported or deliberately skipped options still receive a `not-evaluated` row with a controlled reason code; do not silently omit them. Enforce unique tokens and a bounded item count. A missing, truncated, oversized, or malformed audit makes the trace inadmissible—never silently drop rows.

The host, not the policy, should compute and retain the canonical frontier/prompt digest and bind it to the audit in the encrypted `attemptRecord`. This prevents a worker-supplied digest from being mistaken for independent host verification.

## Preserve actual selection semantics

Do **not** impose a universal “selected score must be the global maximum” validator.

The two policies use different selection structures:

- Rank 1's `bestAction` scores supported action items and updates the winner only on strict `>`; equal scores therefore preserve the first item in native frontier order. Its audit must identify this tie-break as `FRONTIER_ORDER_FIRST`.
- The candidate's `chooseRoot` is hierarchical: it first considers play-card scores, then retreat improvement, then payable attacks, then a rule-selected Resetting Hole ability, then pass. A play can be selected before a higher raw score in another action family is considered. Its audit must preserve the actual stage/selection rule (for example `ROOT_PLAY_THEN_RETREAT_THEN_ATTACK_THEN_ABILITY_THEN_PASS_V1`) and the scores used inside each scored stage.
- Prompt handlers also contain rule-based choices and stage-specific scoring. Where a handler does not compute a numeric score, emit `status: 'rule-selected'` or `'not-evaluated'` with a specific allowlisted reason/rule code. Do not invent a numeric score after the fact.

Where a policy computes multiple components (the candidate's play-card scorer combines basic, evolution, energy, and trainer scores), retain those components in a versioned, bounded sub-object or record the exact effective score plus the component-selection rule. The audit must describe the values actually used, not a new explanatory score.

## Validation at the worker and host boundaries

Worker validation should reject:

- unknown schema/version or unknown keys;
- policy-version or decision-kind mismatch;
- missing/extra/duplicate evaluation tokens;
- tokens not present in the exact request frontier/prompt;
- non-finite or out-of-bound scores;
- a score/reason/status combination inconsistent with the schema;
- unknown selection, tie-break, or reason codes;
- selected-token(s) that differ from the normalized decision;
- an audit exceeding its explicit row or serialized-byte bound.

The host must independently bind the response to the request it issued and check role, seat, policy version, decision kind, exact frontier membership, selected-token agreement, and the host-computed frontier digest. Keep the audit actor-only: the worker may see only its existing actor-visible observation, exact actor-scoped frontier/prompt, and permitted public receipts.

Do not compare all scores across hierarchical stages. Validate only the declared selection rule and the exact decision/audit token agreement. The audit is evidence of the policy's actual evaluation, not a replacement policy or a claim that the scores are strategically optimal.

## Required behavior-preservation tests

Before any registered fixture:

1. For both frozen policy modules, compare `decide(request)` with `decideWithAudit(request).decision` over the existing held-out root and prompt challenge corpus; require deep equality for every decision.
2. Verify the audit is produced from the same single evaluation pass (no second scorer invocation), and the worker-local policy RNG draw count remains zero and unchanged.
3. Cover root and prompt decisions, all selection families exercised by the registered trace, score ties, hierarchical candidate selection, unsupported options, and rule-only branches.
4. Add negative tests for duplicate/unknown/missing tokens, wrong selected token, NaN/Infinity, unknown reason/rule code, policy/role/seat mismatch, missing required audit for the two registered versions, and byte/item limits.
5. Verify the worker response contains no forbidden fields and that sanitized/public artifacts omit the detailed audit; the full audit remains only in the encrypted private trace.
6. Preserve the original candidate/opponent 60-card fingerprints, registered physical seed string and seed32 mapping, seat assignments, and Twinleaf gitlink. If instrumentation changes policy bundle bytes, update the registration's policy/bundle hashes transparently while demonstrating unchanged decisions.

Use existing test and workflow surfaces. Do not create a new workflow or fixture for this work. Any worker, protocol, policy, runner, or workflow change creates a new exact SHA and requires the appropriate contract-only and same-SHA native no-game acceptance before the fixture.

## Trace record binding

For every worker-originated live root/prompt decision, the encrypted record should bind:

- request sequence/id, role, physical seat, policy version, and decision kind;
- exact actor-scoped frontier/prompt and its host-computed digest;
- exact selected token(s) and selected item(s);
- cloned-Store validation receipt and validation mode;
- the complete versioned `policyAudit`;
- action ordinal, action payload digest, dispatch status, and resulting transition.

The public/sanitized manifest may report audit presence, schema version, counts, and a digest, but must not expose tokens, scores, prompt choices, or hidden-state context.

**Acceptance boundary:** if audit capture/validation fails, the first trace is a blocked diagnostic, not a successful natural-terminal trace. Do not substitute a post-hoc reconstruction.
