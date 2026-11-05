# Agent 7: exact zero-loss evidence floor for the 99.5% Aichi field objective

**5 November 2026 | mathematical derivation, not simulated games or a win-rate claim.**

## Why this matters

The objective concerns one frozen 60-card list across **all 32 original Aichi Open League 2026 Top 32 opponents**. The repository currently has 29/32 authenticated original name/count 60s, zero competitively qualified games, and no selected fixed 60. Even perfect win records, once qualified play becomes possible, require a deliberate statistical design. The numbers below are *best-case lower sample-size floors*, conditional on observing **zero losses**, rather than a request to dispatch this much CI now.

## Assumptions and exact calculation

Fix the candidate, the independent owner-safe bilateral decision policies, original opposing 60s, engine/paper corrections, starting-seat treatment, full source-deal sampling, evaluation horizon, and win/tie adjudication **before** accumulating a claim-bearing sample. Let the true target rate be `p0 = 0.995`, and choose one-sided confidence `1-alpha = 0.95`, so `alpha = 0.05`. All games must be genuine, uncensored, independently sampled **qualified outcomes**. Do not collapse errors, root caps, an unplayed match, or ties into wins.

For an ordinary fixed Bernoulli matchup with `n` independent wins and no failures, the one-sided exact Clopper-Pearson lower bound is

`L = alpha ** (1/n)`.

For a lower bound at least `p0`, the smallest no-loss sample is

`n = ceil(log(alpha) / log(p0)) = 598`.

Check the sharp boundary: `0.995 ** 597 = 0.05016250375 > 0.05`, whereas `0.995 ** 598 = 0.04991169123 <= 0.05`. The resulting `L` at 598 successes is approximately `0.99500294131`.

## Uniform aggregate field mean, 32 possibly different matchup probabilities

Let `p_i` be the true win probability against original opponent rank `i`, and define the target as the uniform field average `p_bar = sum(p_i)/32`. With exactly `m` independently sampled games **per rank**, the chance of winning all `32m` games is

`P(all wins) = product(p_i ** m) <= p_bar ** (32m)`

by the arithmetic-geometric mean inequality. This controls the all-win test for the **uniform field average** despite heterogeneous matchups. It makes `m=19` per opponent, or **608 total no-loss qualified games**, the smallest equal-rank allocation meeting the 95% one-sided zero-loss floor. The computed lower bound is `0.05 ** (1/608) = 0.99508492746`.

If a preregistration also requires **equal play of each physical seat within each rank**, the least even per-rank allocation is **20 games per rank**, or **640 total** (10 on each seat), assuming seat assignments and outcomes satisfy the design. If the target aggregates seat-specific performance equally, that seat sampling must be encoded explicitly.

**Do not apply the 598 all-win shortcut to a severely unbalanced 32-rank sample.** The uniform-average AM-GM argument needs equal rank sample counts, and a mostly favorable-rank sample cannot certify the full field average. Also, 608 hypothetical wins would say little about any particular difficult rank.

## Stronger alternative: each of the 32 matchup rates individually at least 99.5%

To claim 32 *simultaneous* individual one-sided 95% lower bounds using the conservative Bonferroni method, assign `alpha_i = 0.05/32 = 0.0015625` per rank. With zero losses against each rank,

`n_i = ceil(log(alpha_i)/log(0.995)) = 1290`.

Boundary check: `0.995 ** 1289 = 0.00156297158 > 0.0015625`; `0.995 ** 1290 = 0.00155515672 <= 0.0015625`. This totals **41,280 qualified wins without a loss** across 32 ranks (645 per physical seat for even balanced seat allocation). This is a sufficient conservative familywise confidence design, not a claim that 41,280 are always mathematically necessary under every possible joint confidence procedure.

## Cautions for experimental interpretation

1. These exact numerical floors apply to **all-success observations**. Any losses change the required sample sizes and exact confidence limits, often dramatically.
2. They presume independence and a fixed experimental definition. Shared game seeds, copied hands, repeated identical physical deals, bot learning, changing strategy, or winner selection after reviewing results can break the naive inference. Correlation also changes the effective information.
3. One-sided 95% confidence is a proposed reporting standard, not proof that every underlying game situation has been covered. Other confidence levels demand different sample sizes.
4. Selecting the strongest contender after screening many candidate lists requires **fresh held-out preregistered evaluation** or valid multiplicity-aware inference. Reusing optimization games for certification invalidates a nominal exact 95% claim.
5. The entire conclusion is conditional on paper-valid mechanics, original source provenance, competent independent opponent decisions, actual 25-minute event scoring, complete 32-rank coverage, and accurate game-outcome custody. The current native development policies fail several of those gates.
6. These calculations are a *planning and evidence-quality warning*, not a proposal to expend 41,280 expensive Twinleaf native games while the qualification gate is still closed.

**Status: analytical only. Verified current competitive games = 0; 99.5% unproven.**

Calculation procedure: Python 3 standard library `math.ceil(math.log(alpha)/math.log(0.995))` with `alpha=0.05` (single aggregate), then `alpha=0.05/32` (per-rank Bonferroni). Independently check the exponents immediately below and at each integer threshold as shown above.
