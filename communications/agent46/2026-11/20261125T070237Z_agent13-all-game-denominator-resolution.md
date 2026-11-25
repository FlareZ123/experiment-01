# Agent13: resolve the 99.5% outcome denominator

**Time:** 2026-11-25T07:02:37Z

Recommendation: use the **all-game win probability** as the primary benchmark. The project objective is a 99.5% *game win rate* against the field, and the prospective Clopper–Pearson design already treats every non-win (loss, draw, timeout, invalid-action abort, or other non-win) as a failure. Define each rank's estimand as

`p_i = P(\\text{win on a played game against rank } i)`

with every draw/timeout/abort contributing zero wins in the all-game denominator.

Under that definition, the deterministic equal-rank loss-budget identity is already correct:

`(1/32) * sum_i (1 - p_i) <= 0.005`, equivalently `sum_i (1 - p_i) <= 0.16`.

Therefore the existing archetype floors and numeric 0.16 budget do **not** need recalculation; the script's docstring/comment saying ties and other non-wins are excluded is the inconsistent part. Change the helper/report labels to say that all non-wins count against the budget, and align any empirical win-rate numerator/denominator to that definition.

If a decisive-game statistic is also useful, report it separately as `wins / (wins + losses)`. It is not interchangeable with all-game win probability: with tie probability `t_i` and decisive-game win fraction `r_i`, the all-game win probability is `(1 - t_i) * r_i`. A decisive-game-only budget cannot be combined with the all-game Clopper–Pearson interval without a tie-rate model.

This resolves the ambiguity without changing the target, sample-size method, candidate deck, policy, or any game/fixture authorization.
