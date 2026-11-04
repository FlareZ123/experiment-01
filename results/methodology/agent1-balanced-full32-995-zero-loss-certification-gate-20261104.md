# An exact 99.5% whole-field evidence gate: balanced 32-by-seat independent games

**Agent 1 | 4 November 2026 | prospective evaluation design, mathematical proof | zero competitively qualified games.**

## A concrete, falsifiable full-field certificate if an extraordinarily strong final 60 is ever found

For the proposed target of one unchanged, legal Expanded sixty beating the Aichi 2026 Top32 at a **99.5% overall game-win probability**, define the primary estimand as an **equal-weight mean over all 32 original opponents and both physical candidate seats** (64 equally weighted cells). Opponent choices, setup, coin decisions, physical randomization, paper clock and legal decisions remain part of each cell's fixed game-generating policy.

To make a **one-sided 95% confidence statement above 99.5%**, an efficient predeclared all-win design is:

- **32 original opponent sixties**, none missing, exactly as historically registered.
- **Two physical candidate seats** against each opponent.
- **10 independent, paper-qualified games in each of the 64 cells**.
- Exactly **640 wins from all 640 independent completed games**, with zero losses, draws, invalid actions, capped nonterminals or unresolved outcomes.
- A single immutable candidate sixty and actual symmetric/owner-safe opponent-and-actor policy selected **before** any of those evaluation shuffles are sampled. Any past candidate optimization or policy tuning belongs to separate development data.

If all those gates pass, the exact conservative null bound for an equal-field win probability of 99.5% or less is

\[
P(\text{640 of 640 win}\mid \overline p \le 0.995)\le 0.995^{640}
=0.040436324889279666.
\]

Therefore 640/640 wins would pass this specifically defined **5% one-sided all-win test**; the corresponding conservative one-sided lower confidence limit for the equal-cell population mean is

\[
0.05^{1/640}=0.9953301063421702.
\]

This is a **hypothetical future test protocol**, not a claim that any deck or simulator has produced these wins. The current shared repository has **zero** competitively qualified games.

## Why the 640-game result still works if matchup strengths differ

Let \(p_i\) be the actual game-winning probability in each of the 64 fixed opponent-by-seat cells, \(i=1,\ldots,64\). All games must be independently randomized with a fixed policy. With exactly ten trials in each cell, the probability of all 640 winning is

\[
\prod_{i=1}^{64}p_i^{10}.
\]

By the arithmetic-geometric mean inequality,

\[
\prod_{i=1}^{64}p_i^{10}
\le \left(\frac{\sum_i p_i}{64}\right)^{640}
=\overline p^{640}.
\]

Thus, if the *equal-field mean* \(\overline p\) were 99.5% or less, the probability of this all-win observation is at most 0.0404363, regardless of the heterogeneity among the 64 cells. This is why **equal per-cell replication** avoids silently asserting a common matchup win probability. It does require independent games and the exact intended opponent-weighting rule.

For comparison, under a hypothetical independent random mixture of the same full 64 cells, **598 wins from 598** is the absolute zero-loss sample threshold at 95% one-sided confidence for p >0.995: \(0.995^{597}>0.05\), \(0.995^{598}\le 0.05\). The balanced equal-cell panel needs **640** because it must allocate an integer number of games to every source and seat. Nine per cell gives 576 total and **fails** the 5% criterion even if all 576 win. At one-sided **99% confidence**, fifteen wins per cell or **960 all-win games** would be needed with the 64-cell balanced structure.

## Stronger claim: 99.5% against *each* opponent

A 99.5% **equal-field average** can coexist with some individual matchup strengths below 99.5%. The claim “every one of 32 opponents is individually at least 99.5%” is substantially more demanding.

Using a conservative Bonferroni simultaneous 95% guarantee and **no losses in any stratum**, one needs **1,290 independent all-win games per original opponent**, 41,280 total, to make the stronger **32 separate rank-specific claims**, treating both candidate seats as equally represented inside each rank. To claim the stronger guarantee individually for each of the **64 rank-by-seat cells**, one needs **1,428 zero-loss games per cell**, 91,392 total. These enormous thresholds demonstrate why the scientific target must identify the intended estimand before a supposedly impressive win count is reported. A measured 99.5% *sample proportion* also does not imply a 99.5% *underlying probability* without uncertainty accounting.

## Actual qualification vetoes before any probability is reported

The statistics make sense only after all of the following are established independently:

- Every original opponent is the **authenticated exact registered historical sixty**. The currently missing ranks **23, 25 and 28** prevent the complete 32-opponent benchmark, regardless of how many matches are simulated against the other 29.
- One preselected sixty, stable actual policy and complete versioned Twinleaf/paper-correction state drive every game. Reusing the prospective panel to choose among alternative cards or bot policies introduces selection bias; a fresh, independently registered panel is then required.
- Each game is an actual independent physically randomized trial with owner-information restrictions, valid play actions and resolution, both seats, credible opponent continuation and the **25-minute paper Top32 clock and adjudication**. Native engine success is not sufficient unless audited against paper card text.
- If a game has an unresolved choice, unsupported original card, script error, illegal payment, timeout or incomplete native observation, **record it explicitly and fail the all-win gate**. Dropping these attempts would break the original prospective denominator.
- Native seeds must not be mistaken for equal physical source deals across candidate arms. Paired independent source deals and opponent information boundaries must be checked, as Issue [#25](https://github.com/FlareZ123/experiment-01/issues/25) and the repository README require.

The [pure CommonJS calculator](../../simulation/evaluation/agent1-field-995-certification.cjs) and [regression](../../tests/agent1-field-995-certification.test.cjs) pin these thresholds and the null calculations. [Manual GitHub Actions run 41782224039](https://github.com/FlareZ123/experiment-01/actions/runs/41782224039) completed **SUCCESS**. It ran mathematical tests only, no complete Pokémon game.

**Current standing:** 29/32 historical original sixty-card compositions verified; **0 / 640 qualified all-win panel trials**; no selected final legal sixty; no verified 99.5% field win rate.
