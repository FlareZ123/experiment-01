# Balanced-round sequential comparison for unchanged candidate and reference decks

**Agent 46 | 2 November 2026 | mathematical screening method, no qualified Aichi games.**

## Motivation

The [existing equal-cell paired confidence sequence](agent46-anytime-paired-deal-contrast-20261102.md) supports unequal rank sample counts and does not require outcomes from different opponent cells to be independent. Its Hoeffding bounds are consequently conservative when the experiment genuinely supplies many **prospectively balanced and independent source-deal rounds** over the entire 32-opponent field.

The separate [balanced sequence](../../simulation/evaluation/agent46-anytime-balanced-paired-field-delta.cjs) uses a stronger experimental assumption for a much tighter comparison. It is an alternative **precommitted statistical analysis**, with explicitly stricter admissibility. It must never be adaptively selected after reading outcomes in competition with the earlier estimator at the same alpha.

## Required frozen design

Pick exactly one field stratification in advance: C=32 original ranks, C=64 original rank × candidate physical seat, or C=128 original rank × candidate physical seat × actual player-start identity. Freeze a reference 60, a challenger 60, both-player policy, full paper-game qualification/adjudication, original printed 60 roster and objective. Give this new comparison its permanent candidate ordinal k before any outcome.

For each registered round number r, execute exactly one distinct **two-arm original-source trial pair in each of the C cells**. A round is only complete when all C cells have a registered trial, including any errored/capped/unverified pair. Every cell's trial at index r must contain the same unique `roundId` and all pairs require globally unique `pairId` values. Every source physical-deal fingerprint must be checked separately for reference and challenger. Mismatched source openings contribute the entire unknown contrast [-1,1] and are included in the denominator; a missing game arm must be represented explicitly as `CENSORED`. The external admission process, rather than this statistic, authenticates the identities and source-deal provenance.

**Additional indispensable assumption:** the latent full paper-game paired outcomes are statistically independent across all field cells and all registered rounds. Correlation within the two arms of the *same pair* is acceptable, since their difference is treated as one bounded observation. Shared seeds, adaptive opposing policies, repeated physical deals and hidden coordination can violate the required independence, and a string round ID proves none of it. The per-cell method remains available if this stronger assumption is not supportable.

## Confidence sequence proof

Let the qualified win indicators in one pair be X (challenger) and Y (reference), so D=X−Y ∈ [-1,1]. Its outcome may be censored or invalid, but observed qualified information always provides a pathwise enclosing interval `[d_low,d_high]`, including the fully unknown `[-1,1]`.

At n complete rounds, exactly Cn registered pair scores exist. The pooled lower/upper empirical means `a_n` and `b_n` average *all* interval endpoints. Since the latent score lies inside its pair interval, the latent empirical field contrast lies in `[a_n,b_n]` for any pattern of censorship.

For candidate ordinal k and repeated look n, spend

`delta(k,n) = alpha/[k(k+1)n(n+1)]`.

Hoeffding's inequality on Cn independent bounded range-two pair differences, including the potentially different means in each original-source cell, gives radius

`epsilon(k,C,n) = sqrt(2 log(2 k(k+1) n(n+1)/alpha)/(C n))`.

The union of the budgets across all positive candidate ordinals and all positive n sums to alpha. Therefore the field interval

`[max(-1,a_n−epsilon), min(1,b_n+epsilon)]`

has **simultaneous coverage at least 1−alpha for every repeated look and all preindexed prospective comparisons**, subject to the frozen independent-cell design. If the entire field is untested, the interval is `[-1,1]`. Positive lower contrast establishes only a *relative* challenger improvement at the allocated error budget; this neither certifies the game inputs nor demonstrates the separate 99.5% absolute rate.

## Reproducibility and quantitative contrast

- CJS source: [`agent46-anytime-balanced-paired-field-delta.cjs`](../../simulation/evaluation/agent46-anytime-balanced-paired-field-delta.cjs). Calls the existing strict pair validator to retain duplicate-ID, status and source-fingerprint checks, verifies every common `roundId`, rejects unbalanced cells, and reports `method:'BALANCED_INDEPENDENT_CELLS'` with `competitiveQualified:false`.
- [Ten new pure regressions](../../tests/agent46-anytime-balanced-paired-field-delta.test.cjs) cover zero rounds, censorship, positive/negative/equal contrasts, 32/64/128 cells, 50th candidate, mismatched setup, unique rounds and status rejection. Tested along with the previous ten per-cell regressions against exact GitHub-committed module sources in a V8 CommonJS-style test harness: **20/20 passed**; all four source blob SHAs were recorded in the tool output. The existing manually-dispatched [global statistics CI](../../.github/workflows/aichi-global-field-gate.yml) includes both suites. Dispatching a new remote workflow run on these latest bytes was blocked by the tool's safety checks, so no remote-green status is claimed for the new balanced test.
- **Illustrative *invented* positive-control data:** 100 prospective and independent balanced rounds in all 32 cells, with a certified challenger win and reference nonwin in every pair, would yield 3,200 pairs, a pooled 95%-familywise radius **0.09220329894**, and field contrast lower endpoint **+0.90779670106** for k=1. Under the earlier per-cell construction on these same hypothetically perfect 100×32 results, the radius is **0.58426112724** per cell and field lower endpoint **+0.41573887276**. The striking difference comes from pooling independent field cells, not from any actual observed deck performance.
- The stronger pooled analysis is best planned before any games begin. Simultaneously inspecting pooled and per-cell upper/lower confidence gates, selecting the better one afterward, or changing C after observing outcomes invalidates a single unsplit alpha guarantee. Preregister an alpha split or choose a sole primary statistical test.

## Current applicability

This method is **not yet applicable to inference about real deck strength**. The existing Aichi original-source field has 29 authenticated 60-card opponent lists, 3 missing original 60s at ranks23/25/28, and **zero whole-paper competitively qualified games**. Developmental native engine terminals, staged card-mechanic fixtures, caps and unverified papers remain censored. Original-source decision-policy competence, complete paper effect/cost validation and official 25-minute match clock remain major blockers.

The next executable release should supply the independently audited, prospectively registered immutable original-source trial ledger. Only after a full paper-game qualification gate can these confidence sequences legitimately update the choice of the one fixed challenger 60.
