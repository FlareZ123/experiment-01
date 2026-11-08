# Agent1: statistical evidence thresholds for a 99.5% Aichi Top-32 field claim

**Date:** 8 November 2026  
**Status:** prospective statistical design only; no deck-performance evidence  
**Scope:** fixed 60-card deck and fixed decision policy against the 32 authenticated opponent lists, with matchup-level reporting

## Purpose

The project target is a 99.5% game win rate against the full Aichi Open League 2026 Top 32 field. That claim needs a pre-registered sampling plan, a frozen deck/policy/engine, complete game outcomes, and uncertainty reporting. A high observed percentage from a small or matchup-skewed sample is insufficient.

This note quantifies the sampling burden under an idealized independent Bernoulli model. It does not account for simulator misspecification, weak opponent policies, incomplete card support, or paper-rules discrepancies. Those sources of model error can dominate statistical sampling error.

## Aggregate field-average target

Assume each game is independently sampled from a fixed opponent mixture in which each of the 32 exact opponent lists receives equal probability, with the deck, playing policy, engine revision, and opponent policy frozen. Under that sampling design, each game is a Bernoulli outcome with a common aggregate field-average win probability (p).

For a one-sided 95% exact Clopper–Pearson lower confidence bound, if all (n) games are wins and there are zero losses, the lower bound is:

[
L = 0.05^{1/n}.
]

To make (L ge 0.995), the minimum is:

[
n = leftlceil rac{log(0.05)}{log(0.995)} ightceil = 598.
]

For (l) observed losses, the one-sided exact lower bound is the (alpha=0.05) beta quantile (mathrm{Beta}^{-1}(0.05; n-l, l+1)). The minimum total game counts that retain a lower bound of at least 99.5% are:

| Observed losses | Minimum aggregate games | One-sided 95% lower bound |
|---:|---:|---:|
| 0 | 598 | 99.50029% |
| 1 | 947 | 99.50005% |
| 2 | 1,258 | 99.50039% |
| 3 | 1,549 | 99.50021% |
| 5 | 2,100 | 99.50004% |
| 10 | 3,389 | 99.50001% |

A balanced allocation of 19 games against each of 32 opponents gives 608 total games. With zero losses, the corresponding one-sided 95% lower bound under the uniform-mixture iid assumption is 99.50849%. With one loss in 608 games, it falls to 99.22216%, which does not support the target.

These figures are planning thresholds, not evidence that the simulator's games are representative of paper tournament games.

## Matchup-level claims

If the intended claim is stronger, namely that every one of the 32 individual matchups has a win probability of at least 99.5%, simultaneous coverage is required. A simple conservative approach is Bonferroni allocation of the 5% familywise error budget: (alpha_i=0.05/32) for each matchup.

Under that approach, the minimum games **per matchup** are:

| Losses in each matchup | Games per matchup | Total across 32 |
|---:|---:|---:|
| 0 | 1,290 | 41,280 |
| 1 | 1,744 | 55,808 |
| 2 | 2,135 | 68,320 |

This is deliberately stronger than the stated aggregate 99.5% objective. It illustrates how little can be established about each individual matchup from a few games, even when the aggregate observed record looks perfect.

For an aggregate claim with fixed, balanced stratum counts, do not silently treat a stratified sample as iid if the opponent list is not randomly sampled per game. Pre-register a stratified estimator and confidence procedure for the equal-weighted mean of the 32 matchup probabilities. A conservative option is to construct simultaneous per-matchup lower bounds and average them; a more efficient option requires an explicitly specified stratified likelihood or other validated interval procedure.

## Required experiment controls

Before collecting confirmatory games:

1. Authenticate all 32 exact opponent decklists and freeze their 60-card identities and printings.
2. Freeze one 60-card candidate deck and one decision policy. Any card, policy, opponent-policy, or engine change starts a new confirmatory series.
3. Pin and record the Twinleaf commit, research commit, adapter/hook hashes, and card-pool version for every game.
4. Use independent seeds and pre-register opponent allocation, starting-player/coin-flip balance, and game termination rules.
5. Record all 32 matchup denominators, wins, losses, ties/aborts, and exact outcomes. Report every matchup separately alongside the equal-weighted aggregate.
6. Exclude incomplete games from win-rate denominators and report them separately; never convert engine errors, action caps, or unresolved prompts into wins.
7. Validate opponent policies and game mechanics against paper rules before interpreting the result as paper Expanded strength.
8. Keep a held-out confirmatory seed set. Use development games for tuning and never recycle them as confirmatory evidence.

## Current status and interpretation

The repository's current research synthesis reports zero complete competitive games qualified. Therefore every sample count above is prospective. No deck has demonstrated 99.5%, and no win-rate estimate should be inferred from these thresholds.

Even a statistically sufficient sample against the 32 fixed lists would support only the specified opponent mixture and tested policies. It would not prove a 99.5% real-world tournament win rate if Twinleaf card coverage, opponent decision quality, paper rules, or game sampling are biased.
