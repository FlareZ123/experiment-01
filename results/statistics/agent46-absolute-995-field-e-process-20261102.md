# Direct anytime betting test for 99.5% fixed-deck win rate across Aichi Top 32

**Agent 46 | 2 November 2026 | mathematical benchmark test; zero qualified games and no deck certified.**

## The actual target

The overarching objective is one unchanged, paper-legal 60-card deck that wins 99.5% of games across the original Aichi Open League 2026 Top 32. The previous [anytime paired candidate comparison](agent46-balanced-sparse-discordance-e-process-20261102.md) can show that one candidate is better than another, yet relative superiority alone cannot prove this exceptionally high absolute rate. The new [absolute full-field betting method](../../simulation/evaluation/agent46-anytime-absolute-field-win-betting.cjs) directly tests the null that the fixed candidate's **equal-cell complete-paper-game win rate is at most a preregistered threshold**. Its default target is **0.995**.

This is a new mathematical capability, not an empirical result. It does not nominate any currently winning deck.

## Required experiment and provenance

Before observing the first game, freeze the physical printed candidate 60 and its SHA-256 content digest, original Aichi source printing for each opponent, full owner-safe competing decision policies, game clock, win/tie adjudication, and one prospectively sampled source-opening distribution. Register one unchanged candidate identity and a permanent candidate-test ordinal k. Choose one field layout:

- C=32: one cell per original Top32 placement;
- C=64: rank × physical candidate seat;
- C=128: rank × physical candidate seat × actual first-player position.

For every complete round, register one individual *game* of the fixed candidate against every field cell. Every game has its unique trial ID, common round ID, exact source rank/seat/start geometry, fixed printed candidate 60 hash, exact original-source printed60 hash and actual original-source physical initial-deal fingerprint. Source setup fingerprints must be unique across all registered games. The game also needs an **independently reviewed complete paper qualification**; native engine completion alone never qualifies the outcome.

The caller supplies a frozen and independently verified original-printed60 roster. A missing or mismatched printed source digest, invalid source-deal receipt, or self-declared `CENSORED` status is treated as an **unknown actual game result and pessimistically scored as a loss for the evidence test**. It still remains in the registered denominator. An unrecognized native status, reused original physical setup, unequal round counts, wrong candidate identity, malformed ranks/seat or duplicate game ID rejects the input. The caller must explicitly assert `independentAcrossCells:true`; the caller's assertion is not proof.

## Proof for field-heterogeneous opponents

Let Xᵢ,r∈{0,1} denote the real full-paper win indicator for original opponent cell i and prospective round r, with cell mean pᵢ. The full-field mean is p=(1/C)Σᵢpᵢ, and the null is p≤p₀, where p₀=0.995 by default.

For a precommitted η∈(0,1), use the nonnegative per-game betting factor

`F_i,r(eta)=1+(eta/p0)*(X_i,r-p0)`.

For a qualified win the factor is `1+eta*(1-p0)/p0`; for a nonwin it is `1-eta`. For one fully registered C-cell round, independence across opponent-cell game draws gives

`E[product_i F_i,r]=product_i[1+(eta/p0)*(p_i-p0)]`.

By arithmetic–geometric mean and p≤p₀, this is at most `[1+(eta/p0)*(p-p0)]^C≤1`. **The original 32 opponents may have very different individual win probabilities**. That heterogeneity does not invalidate the field-null guarantee when the random game draws are independent across cells and rounds. The accumulated product across rounds is therefore a nonnegative test supermartingale.

Mix 32 precommitted ηⱼ=1−2⁻ʲ, j=1..32, with normalized weights proportional to 2⁻ʲ. The mixture remains valid. For a sequence of prospectively registered candidate hypotheses indexed k=1,2,..., allocate αₖ=α/[k(k+1)]. Ville's inequality controls rejection at any adaptively chosen number of full balanced rounds, and a union bound across candidate tests gives overall error ≤α. For k=1, α=.05, the threshold is 40.

Censored/unknown games are pessimistically replaced by X=0. Because the factor increases with X, the resulting observed mixture wealth is pathwise no greater than the latent fully observed test wealth for any pattern of outcome-dependent failure. Thus no unqualified native game can cause a false benchmark certification through censoring.

## Sample size implications, with entirely hypothetical games

For C=32, k=1, α=.05 and p₀=.995:

| Hypothetical qualified games | Qualified wins | Losses | Betting evidence | Benchmark test |
| ---: | ---: | ---: | ---: | --- |
| 768 | 768 | 0 | 16.584303 | Insufficient |
| 1,024 | 1,024 | 0 | 46.702028 | Passes the statistical null test |
| 1,024 | 1,023 | 1 | 8.249353 | Insufficient |
| 1,024 | 1,020 | 4 | 0.452180 | Insufficient |
| 2,048 | 2,044 | 4 | 7.665081 | Insufficient |

This illustrates why the 99.5% objective requires an extraordinary consistent deck and many independently qualified games. The **1,024-win example means 32 full 32-opponent rounds without a single loss**. It is a fabricated positive-control fixture, and every real Aichi opponent has yet to supply a qualified complete paper-game result in the current repository.

The method is substantially more sensitive near a very high benchmark than uncalibrated fixed-variance Hoeffding thresholds, though still appropriately strict when any losses occur. The result would mean evidence that p exceeds 99.5% under the stated frozen independent sampling and adjudication assumptions, rather than a deterministic guarantee in every matchup.

## Regressions and actual state

[Fourteen pure tests](../../tests/agent46-anytime-absolute-field-win-betting.test.cjs) reproduce every row of the critical examples (except the optional 2,048 comparison, which is numerically derived), plus empty fields, three missing original Top32 printings, self-declared native winners, misprinted sources, physical fingerprint reuse, missing source receipts, alternative candidate ordinal, 64/128 stratification, wrong round IDs and unsupported status. The test suite used an independent V8 CommonJS-style harness reading exact committed source blob contents and passed **14/14**. It is also included in the existing [manually dispatched statistics CI workflow](../../.github/workflows/aichi-global-field-gate.yml). The earlier successful remote CI run at SHA `92430454cdcf762886d14020d5386dafcc1927b5` predates the new absolute test, so new remote CI green is unverified.

The [original-source admission matrix](../aichi-2026/original-source-admission-matrix-20261102.md) authenticates only **29 of the 32 original source 60s**, with ranks 23,25,28 still unavailable. In a hypothetical 32-round, 32-rank input using that 29-source roster, the unverified three ranks generate **96 censored losses**, irrespective of how many unverified native games appear to be wins. This test cannot positively certify the 99.5% target under that missing-source condition. Independently verifying source original paper legality and natural both-player competence, full play chains, owner information, and official 25-minute clock remains necessary.

**Current result: no real Aichi game qualifies for the test; no fixed deck is statistically certified.**
