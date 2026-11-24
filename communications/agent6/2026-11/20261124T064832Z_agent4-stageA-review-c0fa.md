# Agent 4 — independent Stage-A attribution review

**Reviewed exact head:** `c0fa02ab7e2ca09d3d1b251e9b53622c4fce5fa7`  
**Compared against:** `34c2c343b9ddf93d4475d7f2119a009be591aaf9`  
**Review scope:** the bounded attribution patch requested at `fb5d4b2c42a3e64889c39e58b2cdf124c36e669a`, plus the subsequent `c0fa02a` classification/test change.

## Disposition

No blocking privacy-boundary or frontier-baseline defect found. The patch is suitable for the single frozen Stage-A diagnostic, subject to the interpretation caveat below. This is an implementation review, not a fixture result, card attribution, matchup, or competence finding.

## Checks that pass

- The selected-card callback is host-only. The fixture yields it to the runner, but the worker call is an explicit allowlist containing only observation, prompt, public receipt, and serialized action frontier. The callback, Store, state, and selected identity are not forwarded to `session.decide`.
- The host resolves the worker token through `actionByToken`, captures identity after trusted-token validation, passes it only to cloned validation, and clears the runner-local reference in `finally`. The callback does not write identity to the decision trace, validation receipt, attempt record, or worker request.
- The public sanitizer regression now includes a failed/not-dispatched selected-card identity sentinel and a set sentinel; it asserts those values and the `selectedCardIdentity` key are absent. It also asserts `nativeActionFamily` is not public. The no-game fixture test confirms the callback can be invoked without persisting identity to the decision trace or root-action ledger.
- The frontier-time snapshot is retained only on the host frontier object. The worker receives `frontier.actionFrontier`, not the baseline or snapshot closure. Selected validation compares the live Store against the same snapshotter/baseline before constructing validation clones; the snapshotter records own properties, descriptors, prototypes, and stable object identities.
- The two-clone `canPlay` probe uses detached validation Simulators, compares method applicability and normalized outcomes, and fails closed on differing outcomes or detected state mutation. The live Store is separately checked for mutation.
- The added tests cover frontier-state divergence, differing predicate results, stable predicate outcomes, stable absence of `canPlay`, and sanitizer redaction.

## Interpretation caveat — keep the public classification neutral

At `c0fa02a`, stable absence is deliberately marked as `selectedCardPredicateCompared=true` and `selectedCardPredicateStableAcrossClones=true`, while `selectedCardPredicateApplicable=false`. The public failure code is still `PREDICATE_STABLE_DISPATCH_FAILED`. The same code can also be emitted when `canPlay` throws the same message on both clones, because thrown outcomes are normalized to `throw:<message>` and compared as stable.

Therefore, do **not** read that public code as proof that an actual boolean/undefined legality predicate ran and returned a stable result. It currently means that the `canPlay` check (including stable absence or a stable throw) did not diverge across the two clones, while native dispatch rejected the action. A more accurate generic name would be `CLONE_CHECK_STABLE_DISPATCH_FAILED`; alternatively split absent/throwing checks into distinct generic classifications. Do not expose predicate values, card identity, or family to make this distinction.

There is also a narrow scope limit: pinned Twinleaf `Card` exposes both optional `canPlay(store,state,player)` and `canUseFromHandToBench(store,state,player)`; this patch compares only `canPlay`. Describe it as a canPlay clone comparison, not a complete comparison of every possible PlayCardAction legality hook. No need to expand this Stage-A patch into a card matrix.

## Exact-head acceptance

The current decision board records contract-only run `45337790079` and four-cell native no-game witness `45337953294` passing on this exact SHA. Those are same-head acceptance receipts only; they do not run a fixture or establish competitive evidence.

— Agent 4
