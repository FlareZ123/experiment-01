# Agent15: anytime-valid rejection of the 99.5% fixed-60 target from complete paired-seat blocks

**5 November 2026 | exact block-level mathematical result; seven locally executed Node 22 synthetic tests; zero qualified Aichi games.**

## Gap addressed

Agent7's [single-game rejection method](agent7-aichi-995-anytime-early-rank-rejection-20261105.md) correctly requires a new independent fair random physical seat **for each game**. An A/B experiment that deliberately plays one source-seat-0 game and one source-seat-1 game per pair does not satisfy that method's conditional per-game Bernoulli null, even if it is balanced in aggregate. It may share a physical seed within the pair, making the two outcomes correlated.

This report gives a separate anytime-valid **pair-boundary** test for one frozen candidate and fixed original opponent rank. It tolerates arbitrary within-pair outcome correlation while requiring each complete two-game block to be prospectively registered and conditionally representative of the two seat-specific target-game distributions. Its inference begins **only after both games are qualified and counted**. Any attempt that aborts, caps, lacks paper qualification, or is excluded after seeing an outcome invalidates the required full-block data unless the complete intended block can genuinely be adjudicated.

The project target is an equally weighted 32-original field game win rate of at least 99.5%. Therefore

`sum_{i=1}^{32} (1-p_i) <= 0.16` and **each rank must have `p_i >= 0.84`** as a necessary condition, where `p_i` averages the two physical-source-seat game win probabilities. Let `q_0, q_1` be per-seat probabilities of *nonwin*, with ties counted as nonwins. Under the rank null:

`(q_0+q_1)/2 <= 0.16`; hence `q_0+q_1 <= 0.32`.

## Correlation-robust block proof

Each prospectively fixed block has one fully adjudicated game with the original source in seat 0, and one in seat 1, in either predeclared order. Let `L` be its number of candidate nonwins, so `L` is 0, 1 or 2. The crucial **conditional-on-all-earlier-blocks** requirement is

`E[L | earlier blocks, chosen rank] <= 0.32`.

Because `x -> exp(t*x)` is convex for every `t > 0` and `0 <= L <= 2`, the chord bound gives

`exp(t*L) <= (1-L/2)*1 + (L/2)*exp(2t)`.

Taking conditional expectation shows

`E[exp(t*L) | past] <= 0.84 + 0.16*exp(2t) = M(t)`.

Consequently `G_t(L)=exp(t*L)/M(t)` is a nonnegative factor with conditional expectation at most 1, **regardless of correlation between the two seat outcomes**. Multiplying factors over successive completed blocks creates a nonnegative test supermartingale. A fixed convex mixture of four such processes remains a supermartingale. We preregister components here:

| `exp(t)` | Fixed mixture weight |
| ---: | ---: |
| 2 | 0.20 |
| 4 | 0.20 |
| 16 | 0.10 |
| 1024 | 0.50 |

After `B` complete blocks and `L_total` nonwins, the rank test is

`E_i = sum_k w_k * exp(t_k*L_total) / [0.84+0.16*exp(2*t_k)]^B`.

At every **complete-block stopping time**, Ville's inequality bounds the probability that `E_i` ever reaches `640=32/0.05` under that rank's null by `0.05/32`. A union bound over 32 ranks yields at most **5% familywise false rejection** of the proposed 99.5% goal, *provided* all block assumptions and qualifications hold. It is legitimate to interleave different opponent ranks adaptively, with frozen candidate/opponent policies and fresh independent block-level randomization. Do not inspect an unfinished pair and retroactively decide whether to complete or count it.

This argument requires only the conditional expected **sum** of the two seat nonwins, rather than independent individual seat outcomes. A shared within-pair seed is allowed only if it still produces the correct per-seat marginal distribution and no selective exclusion or game-treatment bias. Identical seeds do not imply identical source physical deals across different 60-card opponents or candidate lists.

## Synthetic, reproducible checks

The pure CommonJS implementation [paired-seat analyzer](../../simulation/evaluation/agent15-aichi-995-paired-seat-rejection.cjs) uses log-sum-exp and strict input validation; its [seven-test file](../../tests/agent15-aichi-995-paired-seat-rejection.test.cjs) passed locally on Node **v22.16.0**.

- It rejects missing/incomplete pairs, absent or duplicate source physical seat, duplicate pair/game IDs, changed candidate identity, rank outside 1..32, unqualified or censored inputs, or absent declared fresh block sampling. Text fields are **self-asserted**, not audited evidence.
- With three synthetic complete blocks each containing **two losses**, the e-value is `169.8311644578485`, below 640. A fourth all-loss block raises it to `1012.3659803144642`, crossing the conditionally valid rejection threshold. Those are **eight synthetic games**, never actual Aichi games.
- The pair-correlated least-favorable boundary distribution `P(L=0)=0.84, P(L=2)=0.16` attains expectation exactly 1 for every component. With 4 independent blocks its exact *first-four-block crossing* probability is `0.16^4 = 0.00065536`, below `0.05/32 = 0.0015625`. This finite enumeration checks one boundary model; the all-time guarantee follows from the supermartingale proof.
- A contrasting seat-skewed boundary `q_0=0.32, q_1=0` yields `P(L=1)=0.32, P(L=0)=0.68`, and every component's expected factor is at most 1. Testing the same data with an individual-game fair-seat e-process would be invalid.
- Twenty thousand synthetic all-loss blocks produce finite log e-values without overflow.

## Scope, failures, and usage

This is a **falsification-only** mathematical tool. A crossing suggests a specific frozen 60 cannot meet the 99.5% all-32 objective. Surviving the test is no evidence of strong play and cannot validate a candidate. The module **cannot certify** actual owner-visible paper play, opponent competence, true original 60, entry into correct physical seat, real match clocks, draw/tie scoring, deliberate deck/seed selection, random-start distributions, correct conditional sampling, policy immutability, or genuine complete pair qualification.

For prospective use, preregister each complete pair before observing either result; preserve both original 60 print digests, candidate print digest, full physical-deal/seat/starting-player information, vendor/hooks/profile revisions, all failed attempts, game clocks, actual decision and receipt trails, and admission decisions. Never input selected native terminal outcomes from old capped/errored records. The repository currently reports **29/32 original complete name/count lists, zero competitively qualified games, and no selected fixed winning 60**. This test has **zero real observations**.

This does not supersede Agent7's method for genuinely independent fair-seat-per-game streams. The two procedures have different sampling requirements and should be selected prospectively rather than retrospectively choosing whichever e-value is larger.
