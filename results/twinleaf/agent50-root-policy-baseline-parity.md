# Agent 50: detached policy baseline agreement gate

**18 October 2026. Evidence class:** real source-dealt pinned-Twinleaf diagnostic with synthetic falsification controls. This result qualifies **zero competitive games**.

## Question and failure mode

The existing rank-10 physical-game hidden-order probe runs two independent full-State clones through fresh `SimpleTacticsAi` objects, keeping the bot's diagnostic random seed the same. Because the real bot can have internal history or a separate policy PRNG, its selected action need not equal the reconstructed original-order bot's selected action. If they differ, comparing reconstructed physical and reversed hidden orders cannot directly describe sensitivity of the observed real root action.

The new gate calculates the original-world detached signature and the actual live-root signature, compares them with `isDeepStrictEqual`, saves `baselineActionMatchedActual` in the event, and requires agreement in the authentic rank-10 source audit before reporting the paired-world result as anchored to a live action. The root action still comes from the ordinary policy; the diagnostic does not substitute it.

## Reproducible evidence

- **Code:** [rank10-hidden-order-live-probe.cjs](../../simulation/twinleaf/rank10-hidden-order-live-probe.cjs), commits `b799f2f` and `557b591`.
- **Synthetic tests:** [rank10-hidden-order-live-probe.test.cjs](../../tests/rank10-hidden-order-live-probe.test.cjs), commit `c7ef487`. A reproducible stateless bot agrees; a stateful bot called once beforehand produces `{"call":1}` in the fresh original-world bot versus `{"call":2}` in the actual root bot, and the gate reports `false`.
- **Compiled/manual CI:** [run 39121787990](https://github.com/FlareZ123/experiment-01/actions/runs/39121787990), head `557b5914ec0d28c2984633443b32065684087044`. All steps passed, including the new synthetic tests and two source-dealt game probes. The previous [run 39121589310](https://github.com/FlareZ123/experiment-01/actions/runs/39121589310) ended red because the first patch omitted a comma in diagnostic limitations; corrected before the successful run.

On the published rank-10 Regidrago versus rank-1 Shadow Rider match, source deal `pilot:10:0:champion-reference:B`, seed `4246551499`:

| Policy arm and authentic decision | Candidate bot, physical/reversed own deck | Original live action | Gate |
| --- | --- | --- | --- |
| Current-v4, global turn 2, root step 15, actor 101; remaining own deck 46 | Same `PlayCardAction` on both determinizations, attaching `Double Dragon Energy ROS` to Active | Same `PlayCardAction` | `baselineActionMatchedActual:true` |
| Historical v3 Timeless intervention, turn 28, root step 215, actor 202; remaining own deck 22 | Same `RetreatAction(clientId:202,benchIndex:1)` | Same `RetreatAction` | `baselineActionMatchedActual:true` |

Both cases preserved the original live State graph and full instrumented/uninstrumented `runMatch` summaries. Historical root215 physical-zone hash `5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d` and continuity hash `0faef7ac48c4f7a82c92413a3e0831b33bcc5ad162336e451d4d8ae4d6235548` remain fail-closed assertions. The historic Timeless intervention arm is separate from the v3 control, as documented by [Agent 22](../aichi-2026/agent22-rank10-root215-arm-lineage.md).

## Exact inference boundary

Agreement in *one selected action* cannot establish that the fresh reconstructed bot has the same complete decision-relevant internal state, observation history, knowledge, or random-stream position as the real bot. Even with baseline agreement, hypothetical alternate orders can produce decisions unlike those of the true live policy's counterfactual self. Therefore this gate **rejects known baseline mismatches** and strengthens traceability; it does not certify full causal information-set noninterference.

Both source contrasts tested one reversed deck order with one equal-seeded fresh-bot policy. The current-v4 actor had no observed whole-deck search before root15, while the archived v3 actor had four observed searches before root215; legitimacy of any known top-of-deck order was not independently verified. Physical engine completeness, policy competence, printed rules fidelity, matchups, and 99.5% win rate remain unqualified.

**Follow-up:** compare actual policy internal-state snapshots and random-position lineage, or establish a replay-safe observation-bound policy adapter; sample multiple permissible unseen-world permutations, independently validate what the actor knows, and avoid using this check alone to promote any competitive outcome.

## Follow-up: detached tactic-score trace

Compiled manual CI [39122412598](https://github.com/FlareZ123/experiment-01/actions/runs/39122412598), head `b25aef8858776042de65b9cf8ee0279149211840`, passed five new synthetic regressions and both authentic rank10 probes. The recorder temporarily wraps `evaluateAction` on each fresh detached bot tactic instance; actual source play and instrumented/uninstrumented match results remain identical.

- Current-v4 turn2/root15: zero recorded candidate-score evaluations in either world. `equalScoreTraces:true` is **vacuous** here; it is not score-invariance evidence.
- Archived-v3 Timeless turn28/root215: nine recorded tactical evaluations in each world, with identical tactic, candidate and score sequences across one own-deck reversal. This is a single-permutation score-level negative control.

The method and unit tests live in `simulation/twinleaf/tactic-score-trace.cjs` and `tests/twinleaf-tactic-score-trace.test.cjs`. These roots show why authentic decisions should be screened for nonzero score evaluations before testing hidden-order score leakage. No game becomes competitively qualified.
