# Rank-10 authentic Heavy Ball exposure and fresh-process replay acceptance

**Agent 36, 17 October 2026.** Scope: the exact source-dealt Aichi rank-1 Shadow Rider champion versus rank-10 Regidrago, physical candidate seat B, actual champion-first schedule seed `4246551499`, immutable `decorrelated-slots-v3` trial `pilot:10:0:champion-reference:B`. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is **one paired diagnostic source deal, not a win-rate sample**.

## Previously completed input replay, newly checked

The [manual transcript CI 38919894636](https://github.com/FlareZ123/experiment-01/actions/runs/38919894636), head `ce0604c14e695f4192ad529c7f87aad15d2ded87`, reconstructed actual actions in a **separate Node process** from the preserved archive [artifact 12054148170](https://github.com/FlareZ123/experiment-01/actions/runs/38919894636/artifacts/12054148170). The runner resolved the same official-source 60-card identities, seed, fixed policy toggles and protected clone mode. The replay checked every archived action input, before/after public counts, both hidden-card-zone order digests, card-history digests and the final result object:

| Source arm | Root Store dispatches | Fresh process verified | Summary equality |
| --- | ---: | ---: | --- |
| Unchanged control | 350 | 350 | True |
| Turn-27 Copycat alternate | 235 | 235 | True |

This is a strong **input-transport and selected-State replay result**. Both `sourceReplayMechanicsVerified` and `qualifiedForCompetitiveInference` correctly remain false because the checked snapshots are narrower than full Twinleaf State/reducer semantics, current clone behavior is only experimentally repaired, and policy/rules/hidden-information competence are unqualified.

A workflow reliability defect remained: `rank10-replay-from-archive.cjs` represents failed reconstruction as a `status:'blocked'` finding and exits normally. As a result, a green run alone previously did not imply either arm replayed. Agent 36 added [strict acceptance](../../simulation/twinleaf/rank10-replay-acceptance.cjs) and [unit tests](../../tests/rank10-replay-acceptance.test.cjs) to the existing manual workflow. The new check requires both distinct arms, positive complete dispatch counts, matching action totals and results. It fails CI on any blocked/partial report. **No source-mechanics or competitive qualification flag is upgraded by this guard.**

## Hisuian Heavy Ball: actual source-use test

The rank-10 packet identified the engine's uncorrected Hisuian Heavy Ball Prize-shuffle path as an unresolved exposure risk. Both immutable source 60s do contain the card, so the possibility cannot be dismissed from deck construction alone. For the actual archived control and alternate, I directly inspected the [live-only Store artifact 12054148170](https://github.com/FlareZ123/experiment-01/actions/runs/38919894636/artifacts/12054148170), and cross-checked the action-record `PlayCardAction` count against the name-bearing `decisionTrace` and `cardsPlayedBySeat` ledger:

| Archived arm | Store `PlayCardAction` | Named decision plays | Sum of two seat ledgers | Hisuian Heavy Ball plays |
| --- | ---: | ---: | ---: | ---: |
| Control | 56 | 56 | 56 | **0** |
| Alternate | 47 | 47 | 47 | **0** |

This closes the **sample-specific use question**: the original uncorrected Heavy Ball shuffle mechanism was **not triggered in either genuine root Store trajectory**. It does not show that the engine correction is unnecessary, nor rule out the card being drawn, held, discarded or prized. Other games, both-starting-order confirmation trials, or changed policies may use it.

The reproducible source-data checker is [`scripts/aichi-rank10-heavy-ball-exposure.cjs`](../../scripts/aichi-rank10-heavy-ball-exposure.cjs), with [coverage/fail-closed tests](../../tests/aichi-rank10-heavy-ball-exposure.test.cjs) added to the existing manual transcript workflow. It checks the three independently recorded action/play counts before asserting historical exposure. It reports new Heavy Ball plays explicitly should the gameplay change.

## What remains open

The companion [root-bot continuity result](../twinleaf/agent1-source-state-continuity.md) found **zero root policy-time authoritative Card changes** under experimental post-super alias reconciliation in this source game, versus seven in the original pinned clone. The five reconciled-mode dispatch-boundary metadata changes are consistent with the opt-in before/after-dispatch Pass and declared-copy history hooks; they are not, by themselves, policy corruption. Neither result establishes full reducer observational equivalence across arbitrary states.

The strongest next gate is an independent full-State/prompt/reducer semantic audit plus competent two-sided decisions and hidden-information fairness, then both starting seats and new independent seeds. Continue to mark the Aichi benchmark **zero qualified games**. Report this paper-rule-specific Heavy Ball outcome as **`not-exercised-in-historical-rank10-B-arms`**, while retaining unresolved exposure for other trial configurations.
