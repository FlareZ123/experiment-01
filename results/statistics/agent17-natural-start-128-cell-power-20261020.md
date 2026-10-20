# Agent 17: native physical seat and natural starter randomization change the 99.5% evidence budget

**20 October 2026. Evidence type: conditional mathematics and deterministic synthetic regression.** No real competitive match outcome is evaluated here.

## A 640-game counterexample

The original raw-field arithmetic gate requires ten games in each of the 64 **rank × actual first/second** strata, and its binomial-comparison calculation correctly targets the corresponding 64-cell average under qualified independent gameplay. The new opt-in stricter gate further distinguishes candidate physical engine seat A/B, yielding 128 rank/start/seat cells. These are **different estimands** unless physical engine-seat effects are proven absent or the sampling design properly standardizes them.

For every rank, consider the following prospective sample counts:

| Candidate physical engine side | Candidate actually first | Candidate actually second | Total |
| --- | ---: | ---: | ---: |
| A | 8 | 2 | 10 |
| B | 2 | 8 | 10 |
| **Total** | **10** | **10** | **20** |

Across 32 ranks this is **640 independently completed all-win trials**, with perfect rank/start balance and perfect aggregate A/B seat balance. Yet the 128-cell counts are `[8,2,2,8]` per rank. The 64-cell target would produce the all-win p-value `0.995^640 = 0.040436324889279666` against mean win probability at most 99.5%.

For the *uniform 128-cell* composite null `mean loss >= 0.005`, the sharp worst-case probability of **zero losses** is `0.99^128 = 0.2762516676992083`, far above 0.05. The proof: all 128 cell loss probabilities must sum to at least `128 * 0.005 = 0.64`. The concave log-likelihood maximizer assigns loss probability `0.01` to each of the 64 under-sampled two-game cells, and zero to the 64 eight-game cells; each two-game cell contributes `(1-0.01)^2`. This is also the output of the repository's [general unequal-allocation sharp null calculator](../../scripts/aichi-field-zero-loss-bound.cjs), tested by [new deterministic regression](../../tests/aichi-physical-seat-imbalance.test.cjs).

**Interpretation:** the original 64-cell result remains mathematically valid **for its stated 64-cell target**. It cannot be silently applied to the 128-cell target in the presence of physical-seat/start interaction. The 128-cell target is an explicit engineering diagnostic against possible positional dependence, and should not be imposed as a substitute definition of real paper performance without justification.

## Why a naturally randomized starter seldom satisfies exact 128-cell quotas

Suppose the sample is prospectively fixed at ten games per rank × physical engine side, with an independent fair first-turn coin flip in each game. Each of the 64 physical-side groups independently produces exactly five starts in each direction with probability `C(10,5)/2^10 = 252/1024`.

The probability of **exactly five/five in all 64 groups** is

`(252/1024)^64 = 1.0725989934374377e-39`.

This is a genuine quantitative limitation of an **exact-balance-only** evidence gate. A naturally sampled 640-game campaign will almost surely be rejected by a strict equality test, regardless of its gameplay results.

A suitable future confirmatory design must specify which target is being tested and use a valid strategy for actual randomized starts. Prospective balanced recruitment based *only* on authenticated starting assignments may be investigated with external registration, full attempted-deal accounting and no outcome-based exclusion. Alternatively, conditional-on-allocation sharp null inference can use the actual 128 cell sample counts with the existing all-win KKT calculator, avoiding a forced exact-equality filter. The latter does not prove independence and is specific to all-win samples.

## Deterministic test and CI

The new [CJS regression](../../tests/aichi-physical-seat-imbalance.test.cjs) proves:

1. the `[8,2,2,8]` per-rank counts pass the 64-cell and aggregate physical-seat allocation arithmetic but have sharp 128-cell all-win p-value `0.2762516677`;
2. perfectly balanced five-per-cell counts have sharp p-value `0.0404363249`;
3. a fixed 640-game independent fair-starter panel reaches perfect 128-cell balance with probability `(252/1024)^64`.

**Compiled manual-only CI [39475177053](https://github.com/FlareZ123/experiment-01/actions/runs/39475177053) PASSED**, including this new regression and the existing balanced raw-statistical suite at commit `453b22011a3fe8f21155b4717f5a5e0c229f9770`. No new per-push CI workflow was added.

## Decision and source limitations

This is a prospective planning and interpretation correction. The field still has exactly **29/32** sourced source lists, with ranks 23, 25, 28 incomplete and **zero competitively qualified real games**. Any applied test additionally requires a single fixed legal 60, verified physical printings, competent frozen source and candidate policies, genuine owner-only choices, a trustworthy paper-correct engine, independent actual game sampling, audited turn-order and seat attribution, and official tournament timing.

The 128-cell statistic is not proof of a separate physical seat *effect* in actual Pokémon paper play. Its purpose is to make a potential engine/player-slot confound visible and, where justified, quantify its impact instead of obscuring it with aggregate start-order balance.
