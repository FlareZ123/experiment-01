# What would constitute credible 99.5% field evidence?

**Agent 41, 29 October 2026.** Exact statistical design calculation, independent of any current deck or Twinleaf result. This provides an inference budget for the repository's one-fixed-60, uniform Aichi 2026 Top32 objective. **Actual competitively qualified games remain zero.**

## The statistical target

Let `p_i` be the probability of the *same fixed 60*, frozen policy and legal play winning a fresh game against the exact deck and suitable frozen opponent strategy of rank `i` under a specified starting-order distribution. If the target weights the Top32 uniformly, the field win probability is

`p_field = (p_1 + ... + p_32)/32`.

The **99.5%** target is `p_field >= 0.995`, equivalent to the sum of 32 per-opponent *loss* probabilities being no more than `0.16`. This means **even one opponent with a loss probability greater than 16% is enough to disprove the field target**, assuming all others could be perfect. Conversely, 84% on one opponent with perfect outcomes on every other opponent exactly reaches 99.5%. The criterion is much more demanding than simply doing well against the most frequent archetype.

The actual distribution of first-player/second-player assignment must be specified, and all 32 original printed opponents must count. A partial 29-list field, archetype substitute, changed candidate 60 or inconsistent policy breaks the stated estimand.

## Zero-loss sample-size sanity check

Under **ideal independent identically distributed games** with known field weights, frozen decision policies, no ties, correct paper rules and error-free observations, an exact one-sided binomial confidence bound after `n` wins in `n` attempts is

`lower95 = 0.05^(1/n)`.

To assert `lower95 >= 0.995` after *zero losses*, the minimum is

`n = ceil(log(0.05) / log(0.995)) = 598`.

At 597 clean wins the lower bound is **0.9949945920**, below 99.5%; at 598 wins it is **0.9950029413**. Any actual loss requires more observations. This is only a simple aggregate sampling design and **does not** guarantee each of the 32 opposing decks has been adequately represented.

A deliberately stronger possible design is to require a **simultaneous one-sided 95% lower bound of at least 99.5% on each opponent's own win probability**, using a conservative Bonferroni per-match error budget of `0.05/32`. Under the highly favorable outcome of no losses in any matchup, it requires

`ceil(log(0.05/32)/log(0.995)) = 1290` wins **per opponent**, or **41,280** total independent wins across all 32. This per-match criterion is stronger than demonstrating an overall 99.5% mean; it is offered as a resource-order illustration rather than a mandatory tournament test. A hierarchical or stratified design may target the aggregate with a different, more efficient interval.

## More important than the confidence formula

The assumptions do the heavy lifting. None of these nominal sample counts are a certification if the engine misses banned cards, resolves Knock Outs incorrectly, feeds hidden opponent information into bot actions, uses unrepresentative source policies, excludes failures, omits paper match-clock behavior, changes the fixed deck during evaluation, or selects successful seeds after looking at outcomes.

Use a **predeclared**, failure-inclusive opponent schedule; retain real first-player seat and both physical initial-deal receipts; explicitly preserve draws, caps, crashes and incomplete outcomes. Do not silently treat censored games as wins. For 32 matchups, report the attempts and uncertainty by rank even if estimating a field average. A clean policy and rules qualification gate comes before increasing sample volume.

The [rank-1 Shadow Rider reference mirror bound](../aichi-2026/mirror-ceiling.md) is a distinct analytic limitation: under symmetric equal-quality play in the exact-reference mirror and uniform 32 weighting, its conditional field ceiling is 98.4375%. That is a **conditional theoretical statement**, not an observed matchup probability or proof about different fixed candidate lists.

Reproduction arithmetic (Python `math`): `ceil(log(0.05)/log(0.995))` gives 598, and `32*ceil(log(0.05/32)/log(0.995))` gives 41280. The formulas require no Monte Carlo approximation.

**Research conclusion:** Short and policy-incomplete native experiments can invalidate assumptions and reveal game defects. Their observed terminal records cannot support a field-level 99.5% victory claim. The immediate highest-value work remains engine/policy validation, exact original field coverage and informative matched-policy comparisons.
