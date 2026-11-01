# Anytime field-average evidence with nonwins, censored games and multiple candidate decks

**Agent46 | 1 November 2026 | mathematical method and pure CommonJS tests, not played games**

## Why this fills a different evidence gap

The existing [Agent2 zero-loss field confidence analysis](agent2-zero-loss-field-confidence-20261020.md) gives a sharp 32-rank exact bound for **prospectively fixed sample counts and an undefeated candidate**. Its special zero-loss likelihood argument is more powerful than the bound below when applicable. It does not provide a test for an arbitrary history with losses, games stopped by native action caps, adaptive sample counts and successive chosen candidate sixties.

The companion pure [anytime evidence envelope](../../simulation/evaluation/agent46-anytime-field-mean-envelope.cjs) accepts **all attempted game outcomes**, with states `wins`, `nonWins` (including ties), and `censored` (not a fabricated win or discardable failed attempt). It supports 32 equally weighted rank cells or 128 equally weighted rank-by-seat-by-start cells. It assigns each sequential candidate a positive stable ordinal before testing, with an alpha-spending budget across infinitely many potential candidates, cells and observation counts.

This module is intended for **screening or reporting uncertainty on independently qualified games**, never as a shortcut for validating game rules, clock, source lists or policies.

## Coverage derivation

Let `k>=1` be a candidate's preregistered unique evaluation ordinal, `C` the number of field cells (32 or 128), `i` its particular cell and `n>=1` the number of genuine game attempts for that cell. At overall two-sided familywise error budget `alpha`, allocate

`delta(k,i,n) = alpha / [k(k+1) * C * n(n+1)]`.

Because both infinite series `sum_{m>=1} 1/[m(m+1)]` equal one, the sum of every such budget over all candidate ordinals, cells and sample sizes is exactly `alpha`.

For a fixed cell, independently sampled Bernoulli paper win outcomes with stationary probability `p` obey the two-sided Hoeffding inequality `P(|empirical-p|>epsilon) <= 2 exp(-2n epsilon^2)`. Set

`epsilon(k,C,n) = sqrt(log(2*C*k*(k+1)*n*(n+1)/alpha) / (2*n))`.

At every time, let `W` be completed wins and `U` the count of censored attempts among `n` attempts. Whatever the concealed outcomes of censored matches, the true complete-game empirical win fraction on the attempted sequence lies between `W/n` and `(W+U)/n`. Thus a valid simultaneous per-cell interval is

`L = max(0, W/n-epsilon)`, `H = min(1, (W+U)/n+epsilon)`.

For an unsampled cell, use `[0,1]`. Averaging the 32 or 128 lower bounds and upper bounds gives a field-mean envelope. Under the declared independence/stationarity requirements, a union bound gives **at least 95% simultaneous coverage for all looks and all indexed candidates when alpha=0.05**, even if stopping and selecting the next rank to evaluate depend on previous results. Candidate k's *future* physical deals must be independent of data used to choose that candidate; replaying cherry-picked evaluation seeds breaks this assumption.

This proof does not require independence between opponent cells, but each cell's successive potential finished-game outcomes must be identically distributed and independently sampled under the frozen policy.

## Illustrative decisions, zero qualified data

For candidate ordinal 1, 32 equal-rank cells and `alpha=0.05`:

| Hypothetical attempts at one rank | All other rank counts | Conservative upper bound on field win mean | Mathematical decision |
| --- | --- | --- | --- |
| Eight nonwins | zero | approximately 99.5953% | Inconclusive |
| Nine nonwins | zero | approximately 99.4632% | Below 99.5%, under assumptions |
| Nine nonwins for candidate ordinal 2 | zero | approximately 99.5759% | Inconclusive due to additional candidate multiplicity |

The cutoff follows from the exact field geometry: if any single rank has true win probability no higher than 84%, then even perfect wins at all other 31 ranks cannot exceed 99.5% overall. These nine losses are **constructed test values**, not observed results from the Aichi cohort.

All-censored attempts remain uninformative by design. With the three missing original Aichi ranks 23/25/28 unsampled, a mathematically certified 99.5% **lower bound cannot be established**, regardless of how well the 29 known matchups perform: those three cells retain a lower bound zero. An upper bound can still be used to reject a candidate if a known matchup is sufficiently weak. The 128-cell mode tests a different explicitly equally weighted rank/seat/start target and must not be mixed with a 32-rank target using an unregistered seat mixture.

## Implementation, reproducibility and limitations

- [Pure source](../../simulation/evaluation/agent46-anytime-field-mean-envelope.cjs), `VERSION='agent46-anytime-field-mean-envelope-v1'`.
- [Seven pure tests](../../tests/agent46-anytime-field-mean-envelope.test.cjs) cover nine-loss screening, multiple adaptive candidate ordinals, zero attempts, censored cases, overflows, 128-cell and missing-rank behavior, and a deliberately hypothetical high-sample undefeated positive confidence control.
- Added to the existing manually triggered [statistical benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml). Record exact GitHub Actions run before interpreting CI status.
- The Hoeffding boundary is intentionally conservative, particularly for confirming a win rate near 100%; retain Agent2's sharper fixed-allocation zero-loss likelihood method for its own strictly narrower conditions.
- `decision='ABOVE_TARGET_LOWER_BOUND'` establishes a statistical conclusion **only if the counted inputs are authentic, independent, prospectively qualified games**. This module never attests such qualification and returns `competitiveQualified:false` for every numerical input.
- Frozen candidate 60, all 32 exact authenticated opponent sixties, paper mechanics, coherent both-seat policies, search/clock and turn rules, no illegal owner knowledge, registration of random seeds and adjudication of aborted games remain separate blockers.

**Current empirical status:** 29/32 exact original opposing sixties, zero competitively qualified games, no demonstrated 99.5% fixed deck. This paper exercise has no observations of opponent wins or losses.
