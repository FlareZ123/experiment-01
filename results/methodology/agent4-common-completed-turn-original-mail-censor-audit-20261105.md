# Agent 4: compare source Mail counterfactuals on actually completed native turns, not equal root counts

**5 November 2026.** Postprocessor of fixed original rank6/rank11 physical-deal A/B/A [native CI 42111418525](https://github.com/FlareZ123/experiment-01/actions/runs/42111418525), [5/5 synchronous regression tests](../../tests/agent4-common-completed-turn-native-exposure.test.cjs), [native eight-arm completed-turn JSON artifact 13455385732](https://github.com/FlareZ123/experiment-01/actions/runs/42111418525/artifacts/13455385732). All input cohorts remain **development-only**: zero competitively qualified games, 29/32 authenticated field inventories and no demonstrated 99.5% win rate.

## Measurement problem

The source-owned Trainers' Mail intervention creates real additional Item, top-four owner choice, and deck-shuffle Store actions. In a game stopped at precisely **96 accepted native roots**, a valid source-search line consumes part of the experiment budget. Therefore a comparison of raw attack counts up to the same *root ordinal* can mislabel additional bookkeeping as a missing attack even when the target player attacks on every eligible observed turn.

This readout operates **only on the archived accepted public root action tapes** from the already registered `agent4-mail-postsetup-original-eight-96root-source-payoff-v3` original eight A/B/A under legacy-identical setup hands and independent postsetup owner physical shuffles. It is a deterministic postprocessor with no new native policy, no card or seed modifications, and no information leaked into gameplay. A global turn is marked complete only when a subsequent accepted native action demonstrates progression to a greater global turn within the same epoch. An arm's last observed turn is censored. The denominator for each A/B comparison is the **intersection** of the two arms' demonstrated completed native turns. A turn-number reset vetoes a directly comparable same-epoch action summary.

## Executed original source results

All **eight** original source/candidate configurations remain in the artifact, including rank11 native errors and capped games. Native run reports **no epoch reset** in this cohort. Under identical source rank6 seed100 physical source seat1:

| Original source and contender | Shared *completed* global turns | Candidate A attack declarations | Candidate B source-Mail attack declarations | Candidate turn4 |
| --- | --- | --- | --- | --- |
| Iron Thorns rank6 vs champion reference | **1–18** | **9 Shadow Mist**, turns 2,4,6,8,10,12,14,16,18 | **9 Shadow Mist**, same turns | Klefki absent in both |
| Iron Thorns rank6 vs New Moon | **1–16** | **0** | **0** | **Klefki played in A and B** |

This corrects misleading **10 vs 9** champion `Shadow Mist` counts at equal 96 roots. The control continued to turn20 and selected its tenth attack, but the source-Mail treatment's final observed window reached only turn18; this is longer root budget consumed by Mail and subsequent owner prompts, rather than an independently demonstrated missing attack or failed decision. The New Moon source Mail B's `Volt Cyclone` turn17 native declaration lies beyond the two arms' shared completed turns and is **properly censored from the matched action-rate comparison**. That source attack has a separate postgame abort readout: actual 140 damage to Mewtwo & Mew-GX followed by unresolved owner `AttachEnergyPrompt`, not a physically settled competitive payoff. There are still zero qualified games.

### Implementation and limits

`simulation/evaluation/agent4-common-completed-turn-native-exposure.cjs` keeps actual public `actionOrdinal`, `turnBefore`, `playerSlot`, action names and public printed cards; only settled nonprompt root actions enter attack and card-play counts. Its test suite covers unequal root budget, final-turn censoring of `Volt Cyclone`, turn-zero exclusion, native clock resets and all-eight study reconciliation. The native artifact and checksum are archived separately, and the parent raw A/B/A outputs remain unchanged.

Equal observed completed turns still **do not establish equivalent causal game states**: source Mail searches change the source's actual cards and public future decisions. The comparison only fixes the observation-window confound. It cannot prove that an attack would have remained available if the game continued, that a card substitution changes strength, or that the automated policy is competitively competent.

For further progress, prioritize actual source mandatory prompt settlement and opponent response, two-seat owner-information safeguards and terminal/clock completeness over attack-count changes caused by unequal native action budget.
