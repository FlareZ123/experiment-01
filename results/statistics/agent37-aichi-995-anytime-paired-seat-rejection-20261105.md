# Agent 37: a correlation-robust anytime hard-rank veto for complete physical-seat pairs

**5 November 2026 | Pure mathematical development and 10/10 executed local Node 22 tests | zero competitively qualified Aichi games.**

## Problem and relationship to existing research

The fixed 60-card goal is at least a 99.5% true game-win probability, equally weighted over the 32 original Aichi Open League 2026 Top 32 opponents. The established [Agent7 rank-specific e-process](agent7-aichi-995-anytime-early-rank-rejection-20261105.md) is valid when *every game* receives a fresh independent fair physical-seat assignment. Agent7 correctly warns that deterministic seat alternation cannot feed that per-game model. The older [Agent38 paired-block bound](paired-hard-matchup-dependence-bound.md) supports a fixed five-block all-nonwin veto with stronger cross-block independence assumptions.

This note supplies a separately preregisterable, **time-uniform sequential hard-rank rejection method for complete one-per-seat blocks**, using every combination of wins and nonwins and permitting arbitrary dependence *within* a pair. The independent-fair-seat estimator remains appropriate under its own declared design. The new implementation is an opt-in separate analyzer, with no change to Agent7's existing code or the current shared game policy.

## Mathematical construction

Write p(i,0) and p(i,1) for one unchanged candidate's true win probabilities against the unchanged original opponent i under physical source seats 0 and 1 and the fixed venue/game protocol. Assuming all 32 opponents have equal weight and the two seats within each matchup have equal weight, the target requires

    (1/32) sum_i (p(i,0) + p(i,1))/2 >= 0.995.

Consequently, each rank must satisfy

    (p(i,0) + p(i,1))/2 >= 0.84,

or else that rank alone contributes more than the total permitted 0.16 sum of rank nonwin probabilities. This is a **necessary** condition for the global goal.

Fix one rank i. Before observing game outcomes, form a block of exactly **two qualified games**, one original-source seat 0 and one original-source seat 1, with the same frozen candidate 60, exact original source 60, opponent policy, and paper-scoring rules. The initial physical deals need not be identical; each seat's conditional marginal must represent its intended genuine fresh-deal distribution. The two games may use dependent randomness. Never drop or selectively replace a block based on its first result.

Let L_t be the number of **nonwins** in complete block t, counting both genuine losses and ties as nonwins. Under the local null H0_i, assuming the conditional law of both seat marginals remains fixed even after previous complete blocks,

    E[L_t | history before block t]
       = (1 - p(i,0)) + (1 - p(i,1)) <= 0.32.

No joint independence of the two game outcomes is needed for this expectation: linearity of expectation suffices.

For any fixed b in (0, 1/0.32], set

    F_b(L_t) = 1 + b * (L_t - 0.32).

Because L_t belongs to {0,1,2}, F_b is nonnegative. Under H0_i,

    E[F_b(L_t) | previous complete blocks] <= 1.

Thus M_b(n) = product from t=1..n of F_b(L_t) is a nonnegative supermartingale starting from one, evaluated only at complete-pair boundaries. It tolerates arbitrary within-pair dependence and adaptively chosen rank scheduling, provided the per-block conditional mean constraint holds for each rank. For audit simplicity we precommit equal weights on b={0.5,1,2,3} and evaluate the mixture

    E_i(n) = [M_0.5(n) + M_1(n) + M_2(n) + M_3(n)] / 4.

A positive mixture of nonnegative supermartingales is another nonnegative supermartingale. Ville's inequality gives

    Pr_H0_i(ever E_i(n) >= 640) <= 1/640.

Applying a 32-rank Bonferroni union bound yields familywise false rejection no greater than 32/640 = 0.05 for **one preregistered frozen candidate**. Crossing at any rank supplies a conditional early rejection of the 99.5% target; surviving without a crossing supplies no evidence of actually achieving 99.5%.

The guarantee concerns *completed blocks* and a fixed candidate. It does not automatically survive choosing among multiple candidate 60s based on the same results, post-hoc selection of promising sequences, outcome-dependent missing second games, changed AI policy, or a skewed/uncertified physical-deal distribution. It also does not establish a paper-valid game result from a claimed input status.

## Audited synthetic regressions

Implemented in [paired-seat analyzer](../../simulation/evaluation/agent37-aichi-995-paired-seat-rejection.cjs) and [ten pure tests](../../tests/agent37-aichi-995-paired-seat-rejection.test.cjs). On local Node 22 all **10/10 tests passed**, with matching published GitHub source/test blob SHAs:

- Module Git blob SHA-1: 91aaee9e613d86edb12600cfa4524061de042756.
- Test Git blob SHA-1: c0c7cdc34655d55699c06575947e6dd968af7e0f.

Synthetic examples, **none from a Pokémon game**:

| Paired-seat pattern for one original rank | Mixture e-value | Threshold conclusion |
| --- | ---: | --- |
| Four blocks, both games nonwins in each | 438.83029696 | No early rejection |
| Five blocks, both games nonwins in each | 2443.39336660 | Crosses 640 at complete pair 5 |
| Six blocks, exactly one nonwin per pair | 247.5857 approx. | No early rejection |
| Seven blocks, exactly one nonwin per pair | 713.1847 approx. | Crosses 640 at complete pair 7 |

At the sharp local null, two adversarial distributions each give mean pair nonwins 0.32:

1. **Unequal seats:** candidate wins seat0 only 68% and always wins seat1. Then L=1 with probability 0.32; otherwise L=0.
2. **Perfectly correlated seats:** both games lose together with probability 0.16; otherwise both win. Then L=2 with probability 0.16; otherwise L=0.

For every precommitted b, the expected one-pair factor is exactly one in both cases. Exhaustively enumerating all 1024 ten-block outcome paths for each case gave threshold-ever-crossing probabilities **0.00034359738368** and **0.00021320351875**, respectively, each below the one-rank allowance 0.05/32 = 0.0015625. These finite-horizon checks complement the general all-horizon proof. Additional tests reject duplicated pair or game IDs, incomplete or duplicated seats, censored engine attempts, deck changes and malformed ranks/outcomes, and preserve finite log evidence over 10,000 hypothetical double-nonwin blocks.

All pairing, source-seat and QUALIFIED strings remain **self-asserted data**. The analyzer explicitly reports paper qualification, pairing, and fixed-policy verification as false. It does not fabricate certified games, sample randomness, independent opponent play, or an official 25-minute clock.

## Practical experiment interface

Each input element declares a unique pair ID, unchanged candidate fingerprint, original rank, a prospectively committed paired-design label and two distinct game records with exact source-seat labels 0/1, unique IDs, outcome win/loss/tie and declared QUALIFIED status. The module accepts the two games in either order and emits the first all-rank threshold crossing only after its pair is completed.

For a real campaign, preregister the exact seat-pair inclusion, all physical starts and non-starts, source and contender printing hashes, frozen two-player policies, independent source ownership and paper-payment proof, engine and adapter revision, opponent decision competence, clock, and terminal adjudication. Any aborted game means the block is incomplete for this pure analyzer; preserve that failed attempt and its reason in the overarching campaign ledger, never silently replace it. Cross-contender seeded games are not one fixed-deck paired study.

**Research status:** The Aichi benchmark has **29/32** authenticated original name/count sixty-card source inventories, with ranks 23, 25 and 28 missing. The current steward-selected bilateral v4 still has zero competitive-qualified games and zero completed admitted field results. This is a new conditional **rejection instrument only**; it does not select a stronger deck or establish a win rate.
