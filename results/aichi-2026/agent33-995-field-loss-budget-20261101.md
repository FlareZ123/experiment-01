# Quantitative feasibility bounds for one fixed deck versus all Aichi Top 32

**Agent33, 1 November 2026.** Mathematical result only, conditional on **uniform weighting of the 32 original opponent decks** and a single unchanged candidate/deck policy. No games are newly certified. Different field-weight choices require different numerical thresholds.

Let `p_r` be the true game-win probability against original opposing rank `r`, including the intended starting-seat distribution and competent bilateral play. Then the equal-weight field objective is

`(1/32) * sum_r p_r >= 0.995`.

Equivalently, its **total probability-of-loss budget** across all ranks is

`sum_r (1 - p_r) <= 32 * 0.005 = 0.16`.

This is an extreme **tail constraint**. It is independent of which candidate deck is nominated.

## Immediate implications

- **One bad matchup suffices to disqualify the 99.5% objective.** If a single rank has `p_r < 0.84`, even a hypothetical perfect `p=1` against every other 31 ranks cannot meet the threshold. At exactly `p_r=0.84` there is no room for *any* other losses.
- Eight ranks at exactly 98% already spend the entire `0.16` deficit budget. Ten ranks at 98% exceed the budget even if the remaining 22 are perfectly won.
- Rank coverage is binding. Currently **29/32 original 60-card lists are authenticated**, leaving ranks 23,25,28 missing. Even if a candidate were guaranteed to win against every known source, the other three would each need **94.66667% average** success to reach 99.5%: `(29 + 3q)/32 >= 0.995`, so `q >= 2.84/3`. At zero success on all three, the equal-weight field rate would be only **90.625%**.
- With only the 29 lists, no amount of testing of the known field can shrink the worst-case uncertainty interval due to the three absent originals: `p_total` is only known to lie between `sum_known p_r/32` and `(sum_known p_r + 3)/32`. That interval's width is **9.375 percentage points** before statistical uncertainty and simulation fidelity are considered.

## A scale check for statistical claims

If a **fixed**, prespecified candidate and test distribution generated fully independent, competitively valid Bernoulli games and every one were won, a one-sided 95% exact binomial lower confidence bound for the common mean exceeds or reaches 0.995 only after at least

`ceil(log(0.05)/log(0.995)) = 598`

consecutive wins. This calculation presumes a defensible sampling distribution, no selection on the observed outcomes, and a valid competitive environment. It is **not** a substitute for the required opponent-level reporting or competence of either bot.

A stronger, highly conservative per-rank certification would use a 95% familywise one-sided Bonferroni condition for *each* of the 32 p-values: each rank needs at least **1,290 zero-loss games**, or **41,280 total**, to establish every `p_r >= 0.995` at that confidence. This is a sufficient rather than necessary route for proving the *average* field goal. It demonstrates why small uncontrolled native pilots cannot support a 99.5% claim.

## Methodological consequence

Testing should track each rank's observed and uncertainty-bounded **loss deficit**, not only a pooled best-looking win rate. A sensitivity analysis may substitute known archetype proxies for the missing ranks, but the result must be labeled proxy-only and cannot close the original-source uncertainty interval. Any native games with unsupported card text, censored roots, incorrect random choices, or subcompetitive policies must be excluded from certified paper-win-rate estimates.

For any alternative nonuniform matchup weighting `w_r >= 0`, `sum_r w_r = 1`, the identical formulation is `sum_r w_r(1-p_r) <= 0.005`; missing-source uncertainty width equals their total weight.

**Present evidence status:** all 32 archetypes identified, 29 exact original 60s, zero competitively qualified matches, no 99.5% fixed deck demonstrated.
