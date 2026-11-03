# Native actor-root acceptance/rejection receipt conservation

**Agent 48 | 3 November 2026 | audit correction, no game-strength evidence**

## Reproduced logical defect

The existing `actorNativeReceiptCoverage()` in `simulation/evaluation/agent48-decision-opportunity-receipt.cjs` checked that the number of retained native receipts did not exceed total dispatches, that their `accepted` flags were Boolean, and that policy decision ordinals were unique and in range. It did **not** reconcile the number of retained **accepted** or **rejected** receipts against the separately recorded `acceptedActorRoots` and `rejectedActorRoots` counters. Therefore two retained receipts (`accepted:true`, `accepted:false`) combined with counters (`acceptedActorRoots:2`, `rejectedActorRoots:0`) could incorrectly report `COMPLETE_POLICY_CLOCK_ONLY`. A fully retained transcript with incompatible recorded outcome classifications is internally contradictory.

The real actor wrapper in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` increments accepted/rejected dispatch counters separately and retains at most the **first 64** `nativeRootAcceptances` entries. Consequently, a capped archive needs a breakdown of omitted outcome categories, rather than inferring a complete accepted/rejected distribution from the retained first 64.

## Correction

Commit [`c2cbf68`](https://github.com/FlareZ123/experiment-01/commit/c2cbf68ad9801d1e75a3223edc0f99b8e8d4c943) changes only the postgame audit helper. For each retained receipt it now counts acceptance and rejection separately; either retained count exceeding its corresponding global counter **fails closed**. It reports `retainedAcceptedNativeReceipts`, `retainedRejectedNativeReceipts`, `missingAcceptedNativeReceipts`, and `missingRejectedNativeReceipts`, and asserts conservation against total missing dispatches. The previously published `status`, total counts, and `nativeActionOrdinalBound:false` semantics are preserved for consistent inputs.

Commit [`36ac80c`](https://github.com/FlareZ123/experiment-01/commit/36ac80c549eb77cd032b7b8750e9712970cd3922) adds three tests: a valid 70-dispatch / first-64-retained mixed outcome with exactly six missing accepted receipts; impossible fully retained outcome-class assertions; and impossible truncated rejection count despite an otherwise valid total receipt count.

**Validation:** 15/15 `tests/agent48-decision-opportunity-receipt.test.cjs` cases included in the [manual statistical benchmark CI 41592413092](https://github.com/FlareZ123/experiment-01/actions/runs/41592413092), head `36ac80c549eb77cd032b7b8750e9712970cd3922`. The workflow completed successfully; the independently named `Verify independent source-deal and real native-opportunity receipt integrity` step and its `test-benchmark` job both passed. No new workflow or upstream Twinleaf modification was made.

## Qualification boundaries

The resulting receipt conservation applies only to supplied actor-audit metadata. The helper has **not** been wired into the current frozen bilateral release, and its retained entries are still policy-decision ordinals, not native Store-action ordinals. It cannot independently attest native Store settlement, card-zone custody, paper legality, opportunity completeness, opponent competence, official match clock, or game win rate. For the single-deck 99.5% research objective, this is an evidence-hygiene correction to apply when integrating truncated actor traces. **No additional original Aichi 60 was recovered, no competitive game was qualified, and no deck ranking changed.**
