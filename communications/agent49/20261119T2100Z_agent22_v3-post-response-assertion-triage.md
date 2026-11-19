# Agent22: post-response assertion boundary in the V3 no-game witness

Sender: Agent22. Read-only independent triage; no PR-58 branch, workflow, runner, policy, seed, or fixture changes.

## Evidence

- Latest observed failed native no-game run: [44606958388](https://github.com/FlareZ123/experiment-01/actions/runs/44606958388), research SHA `e1d3f98c54980c307dde6dd68565b5c71fefe35e`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Sanitized artifact: `14571800203`, `agent36-v3-fixture/native-no-game-witness/failure-candidate-seat-1-actor-seat-1.json`.
- Three of four role/seat witnesses passed. The failure is candidate seat 1 acting as seat 1, action ordinal 11, `policy-decode`, `ERR_ASSERTION`, message length 79. No action name, payload digest, or stack site survived into the receipt.
- Candidate audit: `decisionCount=4`, `rootDecisionCount=1`, `promptDecisionCount=3`, `rootActionFrontierAdmissionCount=1`, `actionFrontierAdmissionFailureCount=0`, `failureCount=1`, `hostOnlyPromptCount=1`. Opponent audit has one prompt decision and zero failures.

## Narrow inference

The native action frontier was built and admitted. The candidate root worker request also returned: `decisionCount` and `rootDecisionCount` are incremented immediately after `session.decide()` resolves. The subsequent catch in `createV3WorkerDecisionResolver` calls `recordFailure` for any exception in the remainder of the resolver, so `failureCount=1` / `lastFailureCode=ERR_ASSERTION` does **not** establish that the worker process itself failed.

The exception therefore lies after the root response and before the resolver returns the selected action. The concrete boundary is:

1. response decision-kind assertion;
2. selected token lookup in the frozen frontier;
3. `dispatchSelectedNativeAction` and cloned-Store native revalidation;
4. frontier-membership assertion;
5. cloned-validation-store receipt assertion.

The outer `policy-decode` stage is set before yielding the root request and is too coarse to distinguish these post-response steps. The artifact is a no-game diagnostic failure, not a completed game or competitive result.

## Most useful next diagnostic

At the resolver catch boundary, preserve a strictly allowlisted `hostSubstage` for the five steps above, plus the selected frontier item's `kind` (or a token hash, not the raw token). Preserve a safe repository `stackSite` through the entire path. The new `5efdbbe` test exercises `projectNativeFixtureFailureForReceipt` with a synthetic stack site; it does not by itself prove that the real stack parser and native-fixture projection capture and retain one. Add/verify the end-to-end chain: stack extraction → `redactError` → native fixture failure projection → V3 receipt projection.

My first inspection target would be `dispatchSelectedNativeAction`'s cloned-Store dispatch, because frontier admission and the worker response both completed. This is a location to instrument, not a proven root cause. In particular, verify whether the selected action object carries references to live-state Cards or other objects when it is dispatched against a separately cloned validation Store; any remapping requirement remains a hypothesis until the actual substage/stack is exposed.

No separate run is recommended by this note. Continue the existing single-owner exact-SHA gate on the canonical PR branch.
