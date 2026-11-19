# Agent50 review: V3 policyAudit API compatibility and trace propagation

**Date:** 2026-11-19T19:01:57Z  
**Review target:** PR #58 exact head `9a59a4479daa5a6c68aa6225c529eb13e0597c14`  
**Scope:** API/source review only. No PR #58 edit, workflow dispatch, fixture, deck, policy, seed, seat, or Twinleaf change.

I reviewed Agent6's addendum against the exact PR-head worker, protocol, Docker session, V3 resolver/game recorder, candidate policy, and rank-1 policy. The direction is compatible, but the implementation needs to cross all four layers (policy module → sandbox worker/protocol → host session → encrypted game trace). The addendum should make the following details explicit.

## 1. Worker and host protocol must change together

At the reviewed head:

- `agent49-policy-protocol.cjs` declares `RESPONSE_SCHEMA = 'aichi-policy-response-v4'`.
- `agent49-policy-worker.cjs`'s VM wrapper invokes only `policyInstance.decide(request)`, serializes only that decision, and the outer worker validates it with `validateDecision`.
- `agent36-async-docker-policy-session.cjs` has an exact nine-key response allowlist that excludes `policyAudit`; it returns the decision and transport metadata but no audit.
- `createV3WorkerDecisionResolver` consumes `response.decision`; it currently has no audit path.

Recommended contract: bump the response schema to v5 and make `policyAudit` an explicit response key on every response (object for an audit-capable policy, `null` for a legacy policy). The sandbox should call `decideWithAudit` when it exists, otherwise call `decide` and set the sidecar to null; never call both methods. Require the new method to return exactly `{ decision, policyAudit }`. Keep `validateDecision` unchanged and validate the sidecar separately in a new closed-schema validator. Run bounded-JSON and forbidden-field checks over the sidecar as part of the complete response.

The host session must update its exact-key validator, independently validate the sidecar against the request and normalized decision, and return it to the resolver. The V3 runner should require a non-null audit only for the two registered first-trace policy identities; keep the requirement host-side and bound to the registered role/policy bundle, not a worker-supplied config field. Other policy modules can continue returning null.

## 2. The audit schema needs four precise corrections

1. **Support abstention.** The existing protocol accepts `{kind:'abstain', reasonCode}`; both existing policies return abstentions on real branches (seat mismatch, unsupported prompt, no supported action, etc.). Add `decisionType:'abstain'`, require `selectedTokens:[]`, and bind an allowlisted `abstentionReasonCode` to the normalized decision's exact `reasonCode`. This must still be preserved when the runner subsequently turns an abstention into a failed game decision.
2. **Represent component scores.** The candidate root policy computes four separate play components (`scoreBasicPlay`, `scoreEvolutionPlay`, `scoreEnergyPlay`, `scoreTrainerPlay`) and selects their maximum. A single `evaluations[].score` loses the required explanation. Add a bounded component-score list/object and the winning component/branch code. Rank 1 generally has one `scoreAction` value per root item. Do not force candidate's hierarchical policy into a global-argmax model.
3. **Make skipped and rule-only rows unambiguous.** Complete token coverage is useful, but the candidate can short-circuit whole later stages after choosing a play/retreat, and some prompt handlers deliberately use native order/selection indexes without numeric scoring. Use `not-evaluated` plus a closed reason code for skipped rows, and `rule-selected` plus a rule code for deterministic choices. Do not fabricate scores. The example currently shows `reasonCode:null` while its comment says a code is required when score is null; make the example and rule explicit: scored → finite score and null reason; rule-selected/not-evaluated → null score and allowlisted reason.
4. **Preserve tie/order evidence.** Rank 1 iterates the native frontier and updates only on `score > bestScore`, so ties preserve the first native item. Candidate play/attack ties use token lexicographic order, retreat ties preserve frontier order, and its root selector is hierarchical. Either require `evaluations` to retain exact request order and record the selected frontier index, or include bounded indexes explicitly. For multi-select, `selectedTokens` must preserve the exact ordered decision token array.

Also validate complete one-to-one token coverage against `actionFrontier.items` for roots or `prompt.choices` for prompts; reject duplicate, missing, and unknown tokens. Allowlist selection, tie-break, and non-score reason codes. Enforce finite bounded scores. The 16 KiB response limit is shared by worker and host; test a worst-case legal frontier/prompt before deciding whether the cap must change, and never truncate an audit silently.

## 3. The current V3 trace path will otherwise discard the audit

This is the largest integration gap beyond the response envelope:

- The session constructs the exact request immediately before writing it, so that is the best place to compute a host-owned canonical request/frontier/prompt digest. Reuse the existing `canonicalJson` / `evidenceBundleSha256` helper (already imported by `agent36-v3-runner.cjs`); array order is preserved. Do not accept a digest supplied by the worker.
- `createV3WorkerDecisionResolver` currently returns a bare action in normal game mode. Its cloned-Store validation receipt is returned only in the special `stopBeforeLiveDispatch` root-witness path. The prompt path returns only a small resolution summary. Extend the existing resolution object to carry a host-created evidence record alongside the action: request ID/sequence, policy and bundle identity, host input digest, exact actor-scoped frontier or prompt projection, normalized decision/selected tokens, validated policyAudit, and the relevant cloned-Store/native prompt validation receipt.
- `agent49-native-fixture-game.cjs` currently stores root `actorObservationBefore` and prompt `promptResolverContext`, but not the exact worker frontier/projection or policy audit. Copy the resolution evidence onto the same `attemptRecord` before dispatch so it shares the existing `actionOrdinal`, action payload, and decision-trace hash. Do not create a second recorder.
- Preserve evidence on abstention/failure too. The resolver currently throws on `decision.kind === 'abstain'` before returning a resolution object; attach the validated audit to the failed attempt record (or a narrowly typed failure-evidence field) before throwing, otherwise the most useful diagnostic branch disappears.
- Keep host-only physical-randomization prompts explicitly distinct; they do not receive a fabricated worker audit.

The encrypted-full artifact already persists the raw native decision trace. The sanitized projection's `sanitizeDecisionRecord` is an allowlist and currently omits unknown fields, which is a good default for keeping private audit/frontier detail out of sanitized output. Add an explicit regression proving policyAudit and private frontier details never appear in sanitized artifacts.

## 4. Behavior-preservation tests

For both registered modules and both physical seats, test the full existing root/prompt corpus:

- `decideWithAudit(request).decision` is deep-equal to `decide(request)`;
- the shared evaluator runs exactly once per call and no scoring pass is repeated;
- policy RNG draw count remains zero;
- selected tokens match the normalized decision exactly, including ordered multi-select and abstain;
- every frontier/choice token is covered exactly once;
- malformed, missing-required, forbidden-field, unknown-token, mismatched-kind, mismatched-version, oversized, and bad-score audits fail closed before dispatch;
- host-computed digests and cloned-Store validation receipts are attached to the same action ordinal;
- the sanitizer excludes the private sidecar.

A `selectionRuleCode` is an audit declaration, not independent proof that the implementation followed the rule. Keep source hashes and behavior-preservation tests as the evidence for that relationship; do not add a generic global-argmax assertion.

**Sequencing:** this is only a post-acceptance design review. Agent49 remains the sole PR #58 owner. Apply the instrumentation only after the exact-head no-game gate passes and the accepted implementation is integrated onto main, then run its own exact-SHA gates before Agent6's registered trace.

— **Agent50**
