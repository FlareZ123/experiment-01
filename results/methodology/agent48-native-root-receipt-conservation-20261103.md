# Native actor-root acceptance/rejection receipt conservation

**Agent 48 | 3 November 2026 | audit correction, no game-strength evidence**

## Reproduced logical defect

The existing `actorNativeReceiptCoverage()` in `simulation/evaluation/agent48-decision-opportunity-receipt.cjs` checked that the number of retained native receipts did not exceed total dispatches, that their `accepted` flags were Boolean, and that policy decision ordinals were unique and in range. It did **not** reconcile the number of retained **accepted** or **rejected** receipts against the separately recorded `acceptedActorRoots` and `rejectedActorRoots` counters. Therefore two retained receipts (`accepted:true`, `accepted:false`) combined with counters (`acceptedActorRoots:2`, `rejectedActorRoots:0`) could incorrectly report `COMPLETE_POLICY_CLOCK_ONLY`. A fully retained transcript with incompatible recorded outcome classifications is internally contradictory.

The real actor wrapper in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` increments accepted/rejected dispatch counters separately and retains at most the **first 64** `nativeRootAcceptances` entries. Consequently, a capped archive needs a breakdown of omitted outcome categories, rather than inferring a complete accepted/rejected distribution from the retained first 64.

## Correction

Commit [`c2cbf68`](https://github.com/FlareZ123/experiment-01/commit/c2cbf68ad9801d1e75a3223edc0f99b8e8d4c943) changes only the postgame audit helper. For each retained receipt it now counts acceptance and rejection separately; either retained count exceeding its corresponding global counter **fails closed**. It reports `retainedAcceptedNativeReceipts`, `retainedRejectedNativeReceipts`, `missingAcceptedNativeReceipts`, and `missingRejectedNativeReceipts`, and asserts conservation against total missing dispatches. The previously published `status`, total counts, and `nativeActionOrdinalBound:false` semantics are preserved for consistent inputs.

Commit [`36ac80c`](https://github.com/FlareZ123/experiment-01/commit/36ac80c549eb77cd032b7b8750e9712970cd3922) adds three tests: a valid 70-dispatch / first-64-retained mixed outcome with exactly six missing accepted receipts; impossible fully retained outcome-class assertions; and impossible truncated rejection count despite an otherwise valid total receipt count.

**Validation:** 15 then 18 `tests/agent48-decision-opportunity-receipt.test.cjs` cases included in the [manual statistical benchmark CI 41592413092](https://github.com/FlareZ123/experiment-01/actions/runs/41592413092), head `36ac80c549eb77cd032b7b8750e9712970cd3922`. The workflow completed successfully; the independently named `Verify independent source-deal and real native-opportunity receipt integrity` step and its `test-benchmark` job both passed. No new workflow or upstream Twinleaf modification was made.


## Additional matched-comparison integrity correction

The same adapter had a second false match path: `pairedComparisonId` could vary across roots within one `trialId`, while the aggregation would count each label's collection of trial IDs independently. A three-trial cohort could also be counted under one nominal paired-comparison ID. In both cases the displayed number of completed two-arm comparisons could misrepresent the actual registered unit.

Commits [`d6a8aa7`](https://github.com/FlareZ123/experiment-01/commit/d6a8aa73b42148800a617448b5abdf45dad47fc9) and [`7268f10`](https://github.com/FlareZ123/experiment-01/commit/7268f10d1369fa58a215e0dfb9510fab6988cbc1) require each physical trial's comparison identity to remain constant across roots (including the distinction between tagged and untagged records), reject more than two distinct trial IDs per pair, and count complete comparisons only when exactly two distinct trials are registered. Three additional tests cover valid multi-root pairing, contradictory relabeling, partially missing labels, and a three-arm false pair.

**Validation of the combined six new cases and prior twelve:** [manual benchmark CI 41593049952](https://github.com/FlareZ123/experiment-01/actions/runs/41593049952), head `fffab989be7bdb1268279856322bad60135e3460` (one unrelated later agent commit, verified descendant of our `7268f10`), completed successfully. Its independent receipt-integrity test step passed; the 18-case test file is now green in repository CI. This still measures registration consistency only: two trials with a matching claimed fingerprint are **not** automatically proven to share the same physical source deal without separately validating the fingerprint producer and initial source card zones.

## Qualification boundaries

The resulting receipt conservation applies only to supplied actor-audit metadata. The helper has **not** been wired into the current frozen bilateral release, and its retained entries are still policy-decision ordinals, not native Store-action ordinals. It cannot independently attest native Store settlement, card-zone custody, paper legality, opportunity completeness, opponent competence, official match clock, or game win rate. For the single-deck 99.5% research objective, this is an evidence-hygiene correction to apply when integrating truncated actor traces. **No additional original Aichi 60 was recovered, no competitive game was qualified, and no deck ranking changed.**
