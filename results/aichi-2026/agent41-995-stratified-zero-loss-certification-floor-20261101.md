# Agent 41: exact lossless-trial certification floor for 99.5% uniformly weighted Aichi Top32

**1 November 2026 | analytic derivation, not observed game outcomes.** This is a lower-bound experimental design calculation for the one fixed, unmodified paper Expanded 60-card deck against the authenticated Aichi original-source 32. It is not evidence of the deck's strength.

## Question

What is the smallest balanced **independent, paper-qualified, validly played** game sample that could reject the hypothesis that a fixed deck's **uniformly weighted mean field win probability** is at most 99.5% at one-sided 5% significance, in the unusually favorable case of **zero observed losses**?

## Derivation

Let `p_i` be the unknown true win probability against original ranked opponent `i`, including the prescribed random game start, paper rules, fixed competent policies, physical game clock, mulligan/prize randomness and other declared sampling conditions. Assign equal field weight `w_i = 1/32`, and let `p_bar = sum_i p_i / 32`.

Suppose **each rank has exactly n independent valid games** under the fixed candidate list and declared policies, with all **32n** games recorded as wins. Then:

```text
P(all 32n wins given p_1,...,p_32)
    = (p_1 × ... × p_32)^n
    <= ((p_1 + ... + p_32)/32)^(32n)       [AM-GM]
    = p_bar^(32n)
    <= 0.995^(32n)                         [null p_bar <= 0.995]
```

The key benefit is that **the 32 matchup probabilities need not be equal**; the AM-GM bound controls a stratified but balanced zero-loss sample despite matchup heterogeneity. Independence *within and across game outcomes* is still assumed, and no adaptive candidate retuning after observing tests is allowed without correcting for multiple testing.

For one-sided `alpha=0.05`, reject the composite null based solely on zero losses if:

```text
0.995^(32n) <= 0.05

n >= ceil[ln(0.05)/(32 ln(0.995))] = 19 games per rank.
```

- `n=18`: 576 games, maximum all-win null likelihood **0.0557307015**, insufficient at 5%.
- `n=19`: **608 games**, maximum all-win null likelihood **0.0474715152**, just below 5%.
- The corresponding exact one-sided, zero-loss stratified mean bound is `0.05^(1/608) = 0.9950849275` for this predeclared rejection procedure.

If instead the objective demands a simultaneous **separate 99.5% lower confidence bound for every individual matchup**, one conservative Bonferroni design needs **1,290 independent lossless games *per opponent***, **41,280 total**, to guarantee familywise 5% one-sided coverage via `32 × 0.995^1290 = 0.0497650151`. That stronger requirement is **not** the prompt's primary uniformly weighted aggregate field objective.

## Deterministic matchup-loss budget: why the worst opponents dominate

Irrespective of how the candidate deck is tested, a uniform Top32 field mean of at least 99.5% permits only

```text
sum_i (1 - p_i) <= 32 × (1 - 0.995) = 0.16.
```

This is the **total allowable sum of the 32 matchup-specific loss probabilities**, not a sample estimate. Since each component is nonnegative, **every opponent's true win probability must be at least 84%**, even if the other 31 were mathematically unbeatable. For `k` opponents sharing the aggregate worst-case loss budget equally, their required average win probability is at least `1 - 0.16/k` if all the remaining opponents are perfect:

| Difficult matchups sharing all the allowed loss | Minimum average win probability among those k |
| ---: | ---: |
| 1 | **84.000%** |
| 2 | **92.000%** |
| 3 | **94.667%** |
| 4 | **96.000%** |
| 8 | **98.000%** |
| 16 | **99.000%** |
| 32 | **99.500%** |

For example, the known original rank6/24/29 Iron Thorns archetypes are **three distinct original Top32 lists**. If a fixed deck could attain only 90% real win probability against each of these three and a hypothetical 100% against all other 29, its maximum equal-field average would be `(29+3×0.9)/32 = 99.0625%`, already below the target. No simulator data in this report establishes any real actual win probability. This is solely a deterministic feasibility constraint on future credible claims.

The authenticated field and independently sourced missing-player archetype assignments give a sharper **group-specific necessary condition**, assuming uniform rank weight, all **other** ranks hypothetically perfect, and every printed-list variant within a group counted separately:

| Observed Aichi Top32 archetype group | Number of distinct original ranked opponents | Required minimum group-average win probability |
| --- | ---: | ---: |
| Regidrago, including still-unauthenticated exact ranks23 and28 | **11** | **98.545%** |
| Absol Garbodor | **4** | **96.000%** |
| Iron Thorns ex | **3** | **94.667%** |
| Alolan Raichu variants, including rank25's still-unauthenticated exact 60 | **3** | **94.667%** |
| Snorlax Stall | **2** | **92.000%** |

The formula for each row is `p_group >= 1 - 0.16 / groupSize`, calculated from the same full-field loss budget and assuming 100% win probability against every remaining rank. This is a logically necessary **average within the named group**, not a prediction or a measured matchup win rate. Source variants of one archetype can still differ materially in matchup and paper interactions. The other nine unique ranked archetype positions together complete the 32 source decks.

The important methodological consequence is **hard-matchup triage**: the objective's total loss budget is so narrow that a single genuine 80%-win counter matchup makes 99.5% logically unreachable under uniform ranks. Swapping consistency cards to increase already dominant matchups cannot compensate for unaddressed severe opponent locks or damage rules. All 32 registered opponents, rather than a favorable subset, must be evaluated.

## Boundaries

1. **Zero losses is an extreme best case.** Even one loss invalidates the simple zero-failure derivation; a larger or differently designed sample and correctly formulated stratified inference would be needed.
2. Any disqualified paper game, action-cap censoring, simulated winner under invalid rules, leaked hidden information, unsupported opponent 60, or unaccounted opponent substitution **cannot be counted as a valid win**.
3. Repeated seeded games, correlated paired runs or fixed deterministic match repetitions can violate the independence premise. A proper source-rank/starting-seat stratification, unbiased RNG, declared game clock and player policy are essential. Repeating a favorable test seed is not 608 independent games.
4. The test measures only the **registered fixed candidate 60** against the **registered 32 original source 60s** and policies. Searching many candidates and reporting only the one that happened to achieve zero losses on the same test set invalidates the naïve 5% threshold without a held-out confirmation stage or multiplicity correction.
5. A balanced sample with 19 games per rank does not establish a 99.5% win chance *for every rank*. A deck might be weak into a rare rank while maintaining a high field average if its other matchups are exceptional. Opponent weighting and whether the Aichi field should be weighted uniformly remain explicit research decisions.
6. Current evidence has **29 of the 32 original decklists and zero competitive-qualified games**. The published **32 native developmental attempts** contained **19 untimed engine terminals and 13 caps**, plus unqualified paper prompts. None counts toward the 608-game certification floor.

## Actionable test plan

Use the current known-original 29 lists for **development and falsification only**. Secure exact original ranks 23, 25, 28. Finish one combined paper rules and native effect audit, two-seat honest decision policy and real clock semantics, then **freeze exactly one candidate 60 and all policies/seed-selection rules** before opening a held-out, 32-stratum balanced validation. Report each rank/seat separately, all draws, caps, invalids and losses; aggregate only after each stratum is authentic. If zero losses occur in 19 valid independent games against each source, the above worst-case composite-null calculation provides a defensible one-sided 5% initial statistical rejection at the precise 99.5% threshold under all stated assumptions.

**Reproducibility:** standard log operations and Python `math.log`, `math.ceil` with `alpha=.05`, `p0=.995`, `K=32`. Raw computed values `0.995^576 = 0.05573070148010844`, `0.995^608 = 0.04747151515758818`, `0.05^(1/608) = 0.9950849274554779`. No game simulation was run for this derivation.
