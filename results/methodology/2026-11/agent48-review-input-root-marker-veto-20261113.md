# Agent48: V3 signed-review input-root marker veto

**Status:** defect corrected on open PR #46; Node 22 merge-ref regression passed. This is an evidence-integrity result, not competitive-game evidence.

## Question

Does `evaluateCompetitiveAdmissionV3(bundle, reviews)` fail closed when any fixture marker or invalid format-review status appears anywhere in the evaluator's evidence inputs?

## Finding

The V3 evaluator passed both `bundle` and `reviews` to `inspectAdmissionV3`, but its final recursive fixture/status scan traversed only `bundle`. The separately supplied signed review array is not necessarily reachable from the bundle.

A paper review can therefore carry an own `fixtureOnly:true` property, or a nested review packet can carry an unknown `formatReviewStatus`, while the signature remains valid. If the remaining admission gates pass, the outer production veto would not see these review-only markers. The issue is specifically the omitted evaluator input root; it is not a signature-forgery claim.

## Correction

On PR #46 branch `agent48/v3-expanded-format-contract-clean-20261113`, the collector root is now `{bundle,reviews}`:

```js
const {fixtureMarkerSources,fixtureReviewStatuses} =
  collectAdmissionMarkers({bundle,reviews});
```

The existing single `WeakSet` traversal is retained, so shared references and cycles are handled consistently. Own-property semantics and fail-closed behavior for non-boolean fixture markers and unknown format statuses are unchanged.

## Regression and validation

The added test, `production evaluator scans separately supplied signed reviews for fixture markers and nested format statuses`, constructs two otherwise-valid cases:

1. A paper review with `fixtureOnly:true`, added before signing.
2. A paper review with nested `reviewPacket.formatReviewStatus='unknown-review-state'`, also included before signing.

For each case, the test verifies:
- the paper-review signature is valid;
- the diagnostic evaluator otherwise reports `acceptanceReady:true`;
- the production evaluator reports `fixtureOnly:true`, `acceptanceReady:false`, `competitiveAdmission:false`, and `admissionEligible:false`;
- full process-closure evidence remains present, isolating the marker veto.

PR head `5475cf43222bf883cfbdf74c9fed750cffcbca13` passed Node 22 merge-ref run [43451197655](https://github.com/FlareZ123/experiment-01/actions/runs/43451197655). The synthetic merge commit `2887d4a71d60457df1f4caae2d6dfd7cc062afcd` has main-at-run and PR-head parents; its tree includes Agent47's actor-only v2 changes. Agent3 independently confirmed the merge-tree/v2 result and retracted the initial rebase concern.

## Scope and limits

- This closes one production-admission evidence-integrity bypass in the PR's outer V3 evaluator.
- PR #46 remains open pending repository-owner review. A green merge-ref CI run is not a production release.
- The Aichi field remains 0/32 original physical-source paper-admitted opponents; no game, matchup, fixed-60 nomination or win-rate evidence follows.
- No new workflow, receipt layer, schema or candidate/card variant was introduced.

