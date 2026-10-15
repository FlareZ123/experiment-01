# Aichi 2026: exact mulligan bonus cards and target access

**Agent 9, 15 October 2026.** Mathematical model based on [29 published complete Aichi lists](full-decklists.json); ranks 23, 25 and 28 remain unknown. The reference candidate is the rank-1 Shadow Rider Calyrex list (14 Basic Pokémon, of which three are Shadow Rider Calyrex V).

## Exact result

| Opponent Basic Pokémon | Published placements | P(1+ bonus offers) | P(3+ bonus offers) | P(Shadow Rider V after taking all bonus cards) |
| ---: | ---: | ---: | ---: | ---: |
| 4 | 3 | 56.4234% | 20.3463% | 41.4006% |
| 10 | 1 | 23.1068% | 1.5456% | 37.7211% |
| 11 | 6 | 19.7690% | 0.9780% | 37.5200% |
| 12 | 3 | 16.8682% | 0.6131% | 37.3588% |
| 13 | 3 | 14.3514% | 0.3806% | 37.2283% |
| 14 | 6 | 12.1721% | 0.2338% | 37.1217% |
| 15 | 4 | 10.2892% | 0.1421% | 37.0340% |
| 16 | 3 | 8.6663% | 0.0853% | 36.9616% |

The accepted seven-card opening has a **36.617850%** chance of containing a Shadow Rider V, without bonus cards. Against a four-Basic Iron Thorns opponent, electing to take every offered bonus increases the chance to **41.400597%**, a **4.782747 percentage-point** increase.

## Model and derivation

Both players redraw seven cards until each has at least one Basic; simultaneous mulligans give no bonus. Let pA and pB be the opponent's and candidate's initial mulligan probabilities, and K the number of optional draw opportunities awarded to the candidate:

- P(K=0) = (1-pA)/(1-pA pB).
- P(K=k) = (1-pA)(1-pB)pA^k/(1-pA pB), for k >= 1.
- P(K>=k) = (1-pB)pA^k/(1-pA pB), for k >= 1.
- E[K] = pA(1-pB)/[(1-pA)(1-pA pB)].

For a candidate containing b Basics and t target Basics, the conditional probability of missing every target in a valid seven-card hand is [C(60-t,7)-C(60-b,7)]/[C(60,7)-C(60-b,7)]. After setting six random Prizes, taking k bonus cards misses the target with marginal probability C(53-t,k)/C(53,k). Average over K, with the entire K>=47 tail taking 47 actual draws, then subtract the resulting miss probability from one. Exchangeability of the six randomly Prized cards justifies the last probability.

## Validation and limits

The pure functions and full per-placement report are in [scripts/aichi_bonus_draws.cjs](../../scripts/aichi_bonus_draws.cjs), with [five deterministic regression tests](../../tests/aichi_bonus_draws.test.cjs) and an [independent full-shuffle test](../../tests/aichi_bonus_draws_montecarlo.test.cjs). Five analytic tests and the full-report generation passed [manual CI run 38820327961](https://github.com/FlareZ123/experiment-01/actions/runs/38820327961). An independent full-shuffle simulation of **200,000 setups** passed on [run 38820706232](https://github.com/FlareZ123/experiment-01/actions/runs/38820706232): 56.428% had 1+ bonus offers, 20.308% had 3+ offers, mean offers 1.41112, and **41.4355%** saw the target in accepted hand or bonus draws. These are consistent with the exact results. The fixed-seed simulation observed 18,198 simultaneous double-mulligans, which correctly offer no cards. The workflow's downloadable artifact includes the full 29-placement table.

**This is opening access, not game-win performance.** Every bonus card is optional; the table assumes all are taken. The model excludes tactical value of extra cards, Prize recovery, starting-Active decisions, lock effects, game actions, later deck exhaustion and three unpublished lists. The 99.5% full-field objective remains unverified.
