# Agent 9: bilateral mulligan bonus exclusivity and field sensitivity

**16 October 2026. Evidence class:** exact setup-rule derivation and locally tested full-seven redraw simulation. This is neither match-play evidence nor a competitive win rate.

## Why this matters

The earlier [one-sided optional bonus audit](bonus-draw-access.md) and [joint setup model](agent38-joint-bonus-field.md) describe extra cards available to a candidate. Those are useful marginals. For fixed-deck comparison, the **opponent's** free-card opportunity matters too, especially when changing the number of starting-eligible Basic Pokemon.

Under the supplied [advanced rulebook's setup sequence](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), both players with invalid sevens simultaneously mulligan without offering bonus cards. Once one player has a valid seven, that player's hand is kept; only the other continues to redraw. Consequently, **the two players cannot both receive opponent-mulligan bonus-card offers in the same game.** Offered cards are optional.

## Exact three-outcome distribution

Let \(p_A = \binom{60-b_A}{7}/\binom{60}{7}\) be the opponent's seven-card mulligan probability and \(p_B\) the candidate's, with at least one Basic in each deck. Both seven-card draws are independent.

| Event | Exact probability |
| --- | --- |
| Candidate offered at least one card | \(p_A(1-p_B)/(1-p_Ap_B)\) |
| Opponent offered at least one card | \(p_B(1-p_A)/(1-p_Ap_B)\) |
| Neither offered any cards | \((1-p_A)(1-p_B)/(1-p_Ap_B)\) |
| Both offered cards | **0** |

These events form an exhaustive partition. A repeated simultaneous double-mulligan produces the common geometric factor \(1/(1-p_Ap_B)\). The difference between the two at-least-one probabilities simplifies to \((p_A-p_B)/(1-p_Ap_B)\).

The expected **offers** are \(E[K_B]=p_A(1-p_B)/[(1-p_A)(1-p_Ap_B)]\) for the candidate and \(E[K_A]=p_B(1-p_A)/[(1-p_B)(1-p_Ap_B)]\) for the opponent. These expectations allow arbitrarily many successive mulligans; they describe the number offered, not the number accepted. No game turns, Prize placement, board decisions or win outcomes enter this calculation.

## Exact results for published Aichi field

Source Basic inventories: [opening-hand-audit.json](opening-hand-audit.json); underlying [29 exact full lists](full-decklists.json). Candidate is the rank-1 Shadow Rider composition with **14** starting-eligible Basics. Row outcomes depend only on opposing Basic count, and therefore also apply to Hood Shield v1 (14 Basics).

| Opponent Basics | Candidate offered 1+ | Opponent offered 1+ | Neither | Expected candidate offers | Expected opponent offers |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 56.4234% | 6.0393% | 37.5373% | 1.4124 | 0.0701 |
| 10 | 23.1068% | 10.6567% | 66.2365% | 0.3117 | 0.1237 |
| 11 | 19.7690% | 11.1193% | 69.1118% | 0.2542 | 0.1291 |
| 12 | 16.8682% | 11.5213% | 71.6105% | 0.2084 | 0.1337 |
| 13 | 14.3514% | 11.8701% | 73.7785% | 0.1714 | 0.1378 |
| 14 | 12.1721% | 12.1721% | 75.6558% | 0.1413 | 0.1413 |
| 15 | 10.2892% | 12.4331% | 77.2777% | 0.1166 | 0.1443 |
| 16 | 8.6663% | 12.6580% | 78.6757% | 0.0962 | 0.1469 |

The source roster includes three four-Basic Iron Thorns opponents (ranks 6, 24, 29), so this asymmetry is large for those placements. Their Ability lock and the tactical value of individual bonus cards are separate questions.

Averaging equally across **29 published source ranks**, with the exact observed Basic-count frequencies:

| Fixed candidate Basic count | Candidate offered 1+ | Opponent offered 1+ | Expected candidate offers | Expected opponent offers | Expected net offers |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 14 (champion/Hood) | 18.7875% | 11.2553% | 0.3040 | 0.1307 | +0.17336 |
| 15 (Temple) | 19.1153% | 9.5040% | 0.3088 | 0.1077 | +0.20110 |

A one-slot nonbasic-to-Basic change holding all else fixed moves the source-29 average net offer balance by **+0.02774 cards per setup**. The actual Temple challenger changes several other cards, so this isolated effect cannot justify the deck change or predict game outcomes. Missing ranks **23, 25 and 28** preclude an exact 32-rank field average.

## Reproducibility and validation

- Implementation: [aichi_bilateral_bonus.cjs](../../scripts/aichi_bilateral_bonus.cjs), sharing the existing verified mulligan-probability function.
- Regression: [aichi_bilateral_bonus.test.cjs](../../tests/aichi_bilateral_bonus.test.cjs) checks probability partition, symmetry, one-sided compatibility, exact source-29 averages, changed Basic count and input guards.
- Independent seeded physical-seven redraw test: **120,000 games**, with independent without-replacement card-category sampling of each seven and the actual repeated mulligan procedure. Both marginal probabilities match the analytic values within 0.8 percentage points; neither side was simultaneously offered cards. Six local Node tests passed, and the same checks ran in the successful manual CI job. New tests passed the [manual Aichi opening-audit CI 38874404107](https://github.com/FlareZ123/experiment-01/actions/runs/38874404107) at Git commit `fd1612427b0316b050e1995c8bc726de1f8ad532`. This is a math/setup model validation, not a pinned Twinleaf Store test.

The quantitative outputs describe offering extra starting-hand cards. Their tactical value depends on opponent strategy, draw acceptance, discardability, hand utility, board setup and later deck exhaustion. They provide a controlled resource externality for candidate comparison, without establishing which 60-card list has higher winning strength.
