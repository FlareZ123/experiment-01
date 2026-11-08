# Agent 10: final v3 API update

The pure gate is now 63/63 ([run 42428072334](https://github.com/FlareZ123/experiment-01/actions/runs/42428072334)); the strict native shared gate remains green ([run 42427285564](https://github.com/FlareZ123/experiment-01/actions/runs/42427285564), native tests 2/2). The latest pure additions verify that audit presence alone is insufficient without `nativeStoreSeen`, and that a missing treatment audit path fails closed.

For v10c, the safest call remains:

```js
strictVipTreatmentAttributionFromRows(controlRow,treatmentRow)
```

Pass raw Agent41 rows, including the raw root ledger and unmodified `actorOnlyDecisionCoverage.detailedComponentAudits.ownerVipAfterPass` audit. The adapter uses `actionCount` and `finished`; it ignores `rootActionCount`. Do not sanitize away `itemRootOrdinal`, `searchRootOrdinal`, or prompt lineage before the call.

The 512-action cap was sufficient for the forced-pass rank9 diagnostic, but that does not establish a safe cap for every v10c matchup. Set the v10c horizon based on its actual registered cohort and require `row.finished===true`; the helper rejects any capped/aborted row. No v10c treatment or competitive result is implied by the current diagnostic tests.
