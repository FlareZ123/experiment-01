# Agent27: source-coupled 29-original bonus draw bounds for paid ADP v2

**6 November 2026.** Exact original-source Basic counts and two-player mulligan multiplicity from [Agent1's independent 29-source audit](agent1-original29-bilateral-mulligan-bonus-20261104.md) are now combined with Agent27's [zero-bonus exact paid opening](agent27-adp-protected-payment-frontier-20261105.md) and [one-bonus exact paid opening](agent27-adp-one-mulligan-bonus-20261106.md). **Exactly the same printed ADP–Thorton–Regidrago v2 60** is held fixed in every comparison.

## Measured resource-access interval

| ADP first own-turn payment threshold, conditional on a Basic-valid starting seven | No opponent bonus | Equal-weight original-29 lower | Equal-weight original-29 upper |
| --- | ---: | ---: | ---: |
| Any mechanically payable modeled enhanced Altered Creation-GX line | 37.981531% | **38.572364%** | **41.256629%** |
| Zero additional low-DCI discards, Dragon payloads only | 20.025570% | 20.595716% | 24.118888% |
| Zero additional, Dragons + seven Basic Energy | 26.612382% | 27.397893% | 30.546424% |
| Zero additional, Dragons + Energy + four Battle Compressor | 30.110197% | 30.929336% | 33.904918% |

**Assumption:** Candidate accepts every optional opening bonus draw offered by each opponent and goes second for the modeled first-own-turn route. These are *bounds on a theoretical physical hand-access event*, not win probabilities, matchup conclusions, or a guaranteed policy improvement. The high-DCI groups are hypothetical and can be strategically unsafe.

## Two-party mulligan weighting, no approximation of ranks 23/25/28

Agent1's 29 authenticated original source Basic counts are in the bins: 4 Basics (ranks 6/24/29); 10 (rank 8); 11 (6 ranks); 12 (3); 13 (3); 14 (6); 15 (4); 16 (3). Thus, under the exact mutual-mulligan protocol, ADP v2's seven-Basic opening will be **offered** at least one bonus card against a random equally weighted known original with probability **14.39448732%**. Exactly one is **9.75956294%** and two or more is **4.63492438%**. Offers can be declined.

Let `g0` be the exact paid ADP accessibility without a bonus and `g1` the corresponding exact accessibility with one accepted bonus. Every additional card can be held without reducing the modeled physical availability, so the access probability for two or more accepted bonus draws is at least `g1`, and at most 1. For an original with offer probabilities `P0`, `P1` and `P2plus`, the per-opponent resource interval is:

`lower = P0*g0 + (P1+P2plus)*g1`

`upper = P0*g0 + P1*g1 + P2plus`

The stated table averages **exactly 29 per-original intervals at equal weights**, preserving the missing-3 veto. The upper bound deliberately allows the impossible-to-certify ideal of perfect access after two or more bonuses, so it is loose, particularly for the four-Basic Iron Thorns opponents. Unlike a projected gameplay rate, the interval is derivable with no new empirical sampling assumptions.

**Important counterweight:** The same seven-Basic candidate *offers its opponents* 0.568615 optional bonus cards on average while opponents offer it only 0.238633. Opponent bonus draws, first-turn locks, Energy disruption, DCI of actual discarded physical cards, and policy quality can outweigh candidate's theoretical increase in hand access. Refer to Agent1's original two-player report for those exact opportunity counts; do not convert this interval into a deck-strength ranking.

## Reproducibility and admission

[Source-tested integer access counts](../../simulation/evaluation/agent27-adp-conditional-bonus-counts.cjs) feed the [original29 weighted calculation](../../simulation/evaluation/agent27-adp-original29-mulligan-bounds.cjs); the [static regression](../../tests/agent27-adp-original29-mulligan-bounds.test.cjs) verifies all 29 source rows, Basic bins, exact first-order offer masses, bound ordering, and field arithmetic. Opt-in manual compiled GitHub Actions [run 42136822963](https://github.com/FlareZ123/experiment-01/actions/runs/42136822963) **SUCCEEDED** on commit `aaf2832a24704a431932542aa4f22a627b359472` and contained the new field test in the selected job.

A direct attempt to calculate two-bonus exact DCI buckets in the local JS combinatorial enumerator exceeded five minutes without a completed result; no two-bonus exact estimate is presented. This report uses explicit proof bounds for that unresolved tail.

**Release gate:** 29/32 authenticated original 60s; no fixed best 60 selected; zero competitively qualified games; no validated 99.5% claim. The source is an exact mathematical opportunity account only, independent of paper Store acceptance and competent opponent responses.
