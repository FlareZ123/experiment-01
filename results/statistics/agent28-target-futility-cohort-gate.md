# Agent 28: pre-registered cohort futility for the 99.5% Aichi field target

**20 October 2026. Exact mathematical decision design, no new games.**
This supplies an inexpensive *negative-evidence* gate for a single fixed paper Expanded 60 against the equal-rank Aichi 2026 Top 32 field. It complements [Agent 47's positive confidence sample gate](../aichi-2026/agent47-confidence-sample-gate.md) and the [fixed-candidate decision board](../critic-review-70.md). It does not validate the present engine's decisions, paper game legality or competitive win rate.

## Derivation

Let `p_i` denote the actual probability that the **same fully frozen 60 and fully frozen two-player policies** win an independent, officially adjudicated game against rank `i`, including the prespecified fair draw over physical starting roles. Treat ties, timeouts and losses as nonwins: `q_i=1-p_i`.

Under an **equal-rank** target, win rate at least 99.5% means:

`(1/32) sum_{i=1..32} p_i >= 0.995`, equivalently `sum_{i=1..32} q_i <= 0.16`.

Every `q_i` is nonnegative. For any fixed, specified subset `S` of `m` opponents, its equal-rank average nonwin rate must obey `q_S = (1/m) sum_{i in S} q_i <= 0.16/m`. This bound is sharp: all 0.16 possible total nonwin probability can be concentrated inside `S`, with zero nonwin probability outside it. No assumption of equally difficult matchups is needed.

To use an **exact binomial** test, register a single subset `S`, sample opponent rank *uniformly and independently from S for each game*, then independently sample deals and start roles under the fully fixed protocol. Nonwin indicators have common probability `q_S`, despite different possible `q_i`. Under the 99.5% null, `q_S <= 0.16/m`. For `N` games with at least `K` nonwins, the conservative one-sided null tail is

`sum_{j=K..N} C(N,j) (0.16/m)^j (1-0.16/m)^(N-j)`.

Reject the null at alpha = 0.05 only when this is at most 0.05. The upper null boundary gives the maximum tail for the specified failure count. All thresholds below were computed with exact rational arithmetic.

| Pre-registered rank cohort | m | Independent games N | Minimum observed nonwins for 5% rejection | Exact null-tail probability |
| --- | ---: | ---: | ---: | ---: |
| One specified rank, e.g. rank 6 | 1 | 16 | 6 | 3.15290% |
| Ranks 6 and 11 only | 2 | 16 | 4 | 3.41657% |
| Four exact Absol/Garbodor source ranks 8, 11, 16, 22 | 4 | 8 | 2 | 3.81472% |
| Same fixed four-rank cohort | 4 | 16 | 3 | 2.42445% |
| Any fixed eight ranks | 8 | 12 | 2 | 2.31078% |
| **Currently published 29 exact ranks** | **29** | **8** | **1** | **4.32950%** |
| Complete known 32-rank field, when available | 32 | 8 | 1 | 3.93070% |

**Missing-list implication:** Even while the three exact 60s remain unpublished, one nonwin in **eight qualified independent games**, after *a priori* choosing all 29 known ranks and sampling them uniformly, would reject the 99.5% **equal-32-rank** target at the one-sided 5% level. All three unrecovered ranks receive the most favorable possible 100% win rate under this test. This is a way to **falsify** an extraordinary target sooner, not a way to certify it from eight wins. The 29 ranks must be selected before seeing validation results. Eight games against a cherry-picked rank or favored starts do not qualify.

## Design and qualification limits

1. Freeze one actual 60, printing mappings, opponent exact 60s, the engine, all bot/prompt policies and official time/termination treatment before generating validation outcomes. Historical selected seeds, mechanics fixtures and engine-capped games are **not** samples.
2. Register one primary cohort, fixed `N`, exact seed/seat generation and the rejection rule before play. Inspect the outcome at the registered endpoint. Repeated interim peeking or selecting whichever of many groups looks weakest invalidates nominal 5% false-rejection control. Multiple prospectively tested cohorts need explicit multiplicity correction or alpha spending.
3. Every game samples its rank IID uniformly from the specified cohort, and independently chooses a fair starting role. A **fixed balanced 4-per-rank grid** has a different Poisson-binomial sampling law; applying this binomial tail to that grid without deriving the appropriate null would be invalid. Correlated paired deals and adaptive opponent policies also need different handling.
4. The current game simulation has independently observed opponent-hidden-state decision reversal, mandatory-option null acceptance and source-policy limitations. A simulated engine terminal is not an officially qualified result; exact statistics cannot repair weak play or unfaithful rules.
5. These are single one-sided tests of the precisely stated target. They do not prove a rank-specific win rate or support a positive 99.5% claim. A truly 99.5%-capable deck can be falsely rejected with up to 5% probability under the stated conditions.

**Implementation:** [Pure Python exact fractions/combination module](../../scripts/aichi_rank_target_futility.py) with [four deterministic unit tests](../../tests/aichi_rank_target_futility_test.py). The tests passed locally on Python 3.13, checking exact tails, minimum thresholds, numerical equivalence to independent SciPy binomial tails, boundary cases and invalid inputs. No Twinleaf gameplay was run, and no CI workflow was created.

## Next research integration

Agent 41's canonical bilateral v2 must first demonstrate owner-information-safe actions, real source-first pressure and legal reply, prompt compliance, opponent continuation and official-clock qualification. After that, a **single preregistered** fixed-horizon four-rank or 29-rank falsification cohort can be run on genuinely new independent starts. Preserve every attempted action and nonwin, plus every invalid or unresolved outcome with transparent failure classification. The full field still has only 29-of-32 exact source rosters, **0 competitively qualified games** and **no target-qualified fixed deck**.
