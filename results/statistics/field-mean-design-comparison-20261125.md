# 99.5% Aichi field-mean evidence: comparison of two fixed designs

**Date:** 2026-11-25  
**Status:** methodology synthesis only. No qualified games, deck-performance estimate, or 99.5% claim is established.

## Shared target and outcome definition

The primary estimand is the equal-rank mean single-game win probability across the exact 32 Aichi opponent lists:

`p_field = (1/32) * sum(p_i, i=1..32)`.

The primary denominator is **all played games**. Wins are successes; losses, draws, timeouts, invalid-action aborts, and other non-win terminal outcomes are nonwins. The decisive-game fraction `wins/(wins+losses)` is a separate descriptive statistic and cannot be substituted into the primary confidence procedure.

Equivalently, with `q_i = 1 - p_i`, the 99.5% target requires:

`sum(q_i) <= 32 * (1 - 0.995) = 0.16`.

The 0.16 value is a sum of rank-specific nonwin probabilities, not a literal count of losses. For an archetype occupying `m` ranks, `1 - 0.16/m` is a necessary group-average win floor even if every other rank is a certain win; groups do not receive separate budgets.

The repository's full-field qualification gate additionally requires all 32 authenticated source-60 identities and all 128 rank × candidate-seat × first-player cells. The current field remains 29/32, with ranks 23, 25, and 28 unavailable. Neither design below is presently executable for the full benchmark.

## Design A — IID uniform-rank stream with Clopper–Pearson lower bound

Source: [Agent46 statistical evidence design](../methodology/2026-11/agent46-995-winrate-evidence-design.md).

For every game, independently sample the opponent rank uniformly from 1–32 with replacement, draw an independent seed, and randomize candidate physical seat 50/50. The design should explicitly ensure and record the first-player assignment so the intended four seat/first-player contexts per rank are represented in the target distribution. With a genuinely IID uniform-rank stream, every game is Bernoulli with success probability equal to the equal-rank field mean.

For `n` games and `k` nonwins, the exact one-sided 95% Clopper–Pearson lower bound is `BetaInv(0.05; n-k, k+1)`. The minimum sample sizes that cross 99.5% are:

| Nonwins | Aggregate games |
|---:|---:|
| 0 | 598 |
| 1 | 947 |
| 2 | 1,258 |
| 3 | 1,549 |

Advantages:
- Direct, interpretable lower confidence bound for the field-average estimand.
- Simple fixed-N IID binomial inference.
- Agent46 also provides prospective power planning; at a true 99.9% field rate, 1,258 games gives about 86.7% power and 1,549 gives about 92.8%.

Limitations:
- The IID stream does not itself guarantee all 128 rank/seat/first-player cells are observed.
- If all 128 cells are a separate nomination gate, coverage must be checked separately. Under uniform draws over 128 equally likely cells, the probability that all cells appear is approximately 29.8953% at 598 games, 92.6532% at 947, 99.3380% at 1,258, and 99.9323% at 1,549. These are occupancy probabilities, not win-rate power.
- Do not add games selectively after seeing outcomes or pool a deliberately balanced coverage panel into the IID Clopper–Pearson denominator. A separate panel needs its own stratified analysis.

## Design B — fixed balanced 128-stratum exact field-mean test

Source: [Agent12 exact two-nonwin field-mean design](agent12-exact-two-loss-field-mean-bound-20261114.md), implemented in the current mainline ledger evaluator and independently audited in [Agent39's proof review](agent39-audit-agent12-two-loss-field-mean-proof-20261114.md).

The 128 strata are the 32 opponent ranks crossed with two candidate physical seats and two first-player seats. Play exactly 10 independent games in each cell (1,280 total) and reject the null field mean `p_field <= 0.995` only if the complete panel contains at most two nonwins.

The exact heterogeneous worst-case null p-value is **0.04595004378565184**. The pairwise-equalization proof shows that equal 0.5% nonwin probabilities across the 128 cells are least favourable for the at-most-two-nonwin test, even though cell strengths may differ. Nine games per cell (1,152 total) cannot pass the same rule: the equal-null p-value is 0.07308314434173511.

The current mainline implementation includes:
- `scripts/agent12-exact-two-loss-field-mean-bound.cjs`;
- `scripts/agent12-balanced-kl-field-bound.cjs` and `scripts/agent12-balanced-field-ledger-validator.cjs`;
- `scripts/agent12-exact-two-loss-field-mean-proof.py`;
- `tests/2026-11/agent12-exact-two-loss-field-mean-bound.test.cjs`;
- manual workflow `.github/workflows/agent12-statistical-field-confidence.yml`.

The exact branch requires a digest-bound fixed sampling registration and exactly 10 games in every cell; otherwise the evaluator falls back to its heterogeneous KL method. It is a fixed-sample hypothesis test, not a Clopper–Pearson confidence interval or an anytime-valid procedure. It establishes only the aggregate field mean, not a 99.5% guarantee for every individual opponent.

Advantages:
- Directly satisfies the all-128-cell coverage requirement with equal cell quotas.
- Uses an exact worst-case test over heterogeneous cell probabilities rather than assuming one common win rate across the 128 cells.
- Has an exact-rational proof certificate and an independent mathematical audit.

Limitations:
- Requires 1,280 independent paper-qualified games, a frozen candidate/policy/engine/opponent/adjudication bundle, complete source identities, a fixed preregistered roster, and no optional stopping.
- The report's model label `iid-bernoulli-v1` must be understood as IID within each stratum and independent games across strata; it does not assume equal probabilities across the 128 cells.
- The ledger currently accepts paper-qualified win/loss/tie statuses and rejects unqualified attempts. To align with the all-game definition, every played terminal timeout or invalid-action abort must be represented as a nonwin under the frozen adjudication protocol (for example, paper-qualified loss); a pre-game unqualified attempt must remain a ledger rejection, not be silently discarded or counted as a completed game. Confirm this mapping before treating the exact branch as fully aligned with the newer all-game wording.

## Decision implications

These are two distinct, valid prospective designs for the same field-average question under different sampling assumptions. **Do not pool their samples or switch methods after observing outcomes.** Preregister one method, its exact roster, outcome classification, randomization, and stopping rule before the holdout.

Given the repository's explicit all-128-cell gate, Design B is the more direct operational fit if its outcome mapping, current ledger registration, and independent-game assumptions are confirmed. Design A remains a clean alternative when a genuinely IID uniform-rank stream is preferred and its separate cell-coverage requirement is handled without contaminating the IID inference.

Per-matchup claims remain separate. The Agent46 design's simultaneous one-sided 95% Bonferroni panel requires 1,290 zero-nonwin games per rank (41,280 total) to claim every one of the 32 matchups individually exceeds 99.5%. Neither aggregate design implies that stronger result.

## Evidence boundary

Both methods are prospective statistics, not competitive evidence. The project still has:
- 29/32 authenticated original opponent lists;
- ranks 23, 25, and 28 unavailable;
- no final fixed 60 selected;
- 0/32 qualified competitive matchups;
- no demonstrated 99.5% field win rate.

The statistical design cannot compensate for incomplete source lists, unsupported paper rules, a weak opponent policy, invalid game simulation, correlated physical deals, or an unqualified outcome ledger.
