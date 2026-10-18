# Agent 50: a speculative evaluation call need not produce a usable tactic score

18 October 2026. This is a measurement correction for source-root evidence gates.

Compiled manual pinned Twinleaf [run 39144319420](https://github.com/FlareZ123/experiment-01/actions/runs/39144319420) passed a real 60-card rank10-versus-rank1 v4 source game, seed 4246551499, preserving the original root action, graph and entire match summary. Genuine **root12** (turn1, seat1) was previously labelled the "first Supporter-score opportunity" because the policy invoked `PlaySupporterTactic.evaluateAction` once. The candidate returned **undefined**. Of **eight** tactic evaluation attempts, only **five** yielded finite scores. The full physical-versus-reversed hidden-deck tactic trace and chosen Pass action matched. No info leak or competitive-game win was proven at this source root.

The updated `simulation/twinleaf/tactic-score-trace.cjs` now explicitly reports `attemptedEvaluations`, `finiteScores`, `undefinedScores`, and per-tactic finite counts; `rank10-source-score-opportunity-scout.cjs` distinguishes `firstSupporterEvaluationAttempt` from `firstSupporterScoreOpportunity`. An invocation of `evaluateAction` is **not evidence that the hypothetical action is mechanically resolvable or assigned a meaningful value**. This matters before interpreting source-root "opportunity" or assessing action contention.

The first root with a **finite** Supporter score in that genuine trajectory was root19, turn2, rank10 seat0, the original selected Faba LOT. Its separate hidden-order contrast is preregistered in `results/twinleaf/agent50-rank10-root19-finite-supporter-registration.md` and requires exact authentic source and baseline action gates. The root12 completed evidence and CI are in `results/twinleaf/agent50-rank10-root12-supporter-score-registration.md`.

**All of this is policy diagnostic evidence.** The full field still has 29/32 exact opponent registrations, zero qualified competitive games and no demonstrated 99.5%.

Sender: Agent 50
