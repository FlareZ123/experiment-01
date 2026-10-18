# Agent 44: exact Basic-opening discordance under common card-index shuffles

**18 October 2026.** Evidence: source-printing inventories, exact combinatorics, independent small-deck exhaustive enumeration and source-array cross-check. **No complete or qualified games, matchups or win-rate estimates were measured.**

## Decision relevant to matched seed experiments

When identical physical source-card indices are shuffled by one ideal uniform permutation, changing the card identities at those indices can change whether a seven-card opening hand contains any Basic Pokémon. If one list mulligans and another accepts the identical seven positions, the later shuffle/bonus-draw streams need not remain comparable.

The source-ordered published rank-1 Shadow Rider reference, Hood Shield v1 and Temple v1 lists have respectively **14, 14 and 15 Basic Pokémon**. Previous [printing-position research](../aichi-2026/agent44-candidate-position-coupling.md) found that source-order identity alignment reaches only 28/19/38 card positions, whereas deterministic print-preserving reference alignment reaches 55/55/56 positions. The [aligned input protocol](../aichi-2026/agent26-prospective-source-input-alignment.md) is opt-in and has already been tested on a bounded compiled setup sample.

Here the narrower question is whether an *ideal shared set of initial seven indices* would cause exactly one of two candidate decks to mulligan.

| Source pair | Identically positioned Basic copies in source order | Discordance, source input | Discordance, reference-aligned input |
| --- | ---: | ---: | ---: |
| Rank-1 reference / Hood v1 | 13 | **4.217977244%** (16,290,120 / 386,206,920) | **0%** |
| Rank-1 reference / Temple v1 | 13 | **5.764568900%** (22,263,164 / 386,206,920) | **2.108988622%** (8,145,060 / 386,206,920) |
| Hood v1 / Temple v1 | 13 | **5.764568900%** (22,263,164 / 386,206,920) | **2.108988622%** (8,145,060 / 386,206,920) |

The existing deterministic reference-alignment algorithm preserves all 60 printed copies while making Hood's 14 Basic positions identical to the champion's. Temple has one more Basic than each other list, so any indexwise Basic mask must disagree on at least one position, leaving a mathematically unavoidable **2.108988622%** first-seven acceptance discordance under any perfectly nested Basic masks. This is a lower bound within the specific *same-index, uniform seven-subset* coupling family. It is **not** an absolute lower bound across all possible stochastic couplings or actual game-opening outcomes.

## Exact derivation

Let A and B have respectively a and b Basic positions in their 60-input physical arrays. Let c be the count of indices containing a Basic in both, and let u = a+b-c. For a uniformly chosen subset of k=7 common indices, A lacks any Basic in C(60-a,k) subsets, B lacks any in C(60-b,k), and both lack Basics in C(60-u,k) subsets. Inclusion-exclusion gives the exact number of disagreements:

**N_discordant = C(60-a,k) + C(60-b,k) - 2 C(60-u,k).**

The denominator is C(60,7) = 386,206,920. Integer arithmetic avoids stochastic approximation. Each mismatch represents exactly one list failing the initial Basic condition; both failing is agreement on the condition, though both then need additional shuffles.

## Reproducibility

- [Exact counting helper](../../scripts/aichi-basic-opening-coupling.cjs) returns Basic positional overlap, both acceptance statuses, mismatch numerator and exact denominator.
- [Source-locked and exhaustive toy regressions](../../tests/aichi-basic-opening-coupling.test.cjs) compute all three actual pairings in original and reference-aligned order; the small-deck oracle enumerates index combinations without using the formula.
- The actual Basic identifiers follow the checked 11 printed Basic names also used in [Agent 44's prior valid-hand coupling test](../../tests/aichi-maximal-opening-coupling.test.cjs). The unusual Temple source-row placement of Wobbuffet is accounted for by expanding original JSON source printings in their actual row order.
- The local native Node test of the standalone formula and frozen Basic-index patterns passed **3/3** groups. The GitHub source-locked regression was checked by independently expanding the current three JSON lists through the GitHub connector, but had **not yet been executed under repository CI** at writing.

## Scope and next mechanical falsification

This calculation describes one identical uniform initial seven-index sample, before any redraws, bonus draws, Active selection, Prize assignment or subsequent game action. Same-seed Twinleaf calls may diverge for additional reasons and even equal Basic eligibility does not ensure equal final setups. The result cannot be read as the frequency of whole-game divergence or candidate strength.

For the next frozen, prospective source-dealt both-seat comparison, record per-arm actual mulligan attempts, legal opening seven, optional opponent bonus draws, actual first player and distinct K0-controlled root decisions. Check whether the opt-in aligned protocol reduces **observed one-sided mulligan discrepancies**, preserving the original and aligned protocols as different experimental conditions. Move from this mechanic to a full source-game decision/effect/opponent-response witness before interpreting wins.

**Benchmark unchanged: 29/32 exact opponent lists, zero independently qualified competitive games, no demonstrated 99.5% win rate.**
