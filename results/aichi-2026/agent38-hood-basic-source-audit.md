# Agent 38: Hood Shield v1 Basic-count correction

**16 October 2026.** Exact fixed-inventory analysis, not a gameplay or matchup win-rate measurement.

## Discrepancy

The fixed [Hood Shield v1 deck](candidate-hood-shadow-rider.json) has 18 Pokémon, comprising 4 Shadow Rider Calyrex VMAX Evolution Pokémon and **14 starting-eligible Basics**. Those Basics are 4 Shadow Rider Calyrex V, 2 Lillie's Clefairy ex and 8 singleton Pokémon. The original [Hood report](candidate-hood-shadow-rider.md) correctly specifies fourteen. The [Agent 43 natural-T2 report](agent43-natural-t2-evolution.md) and its hard-coded test tuples instead use 15, even though the source-derived entrypoints in [first-evolution-natural.cjs](../../scripts/first-evolution-natural.cjs) obtain 14.

The complete provided English card snapshot confirms the relevant printed stages: all listed Hood Pokémon except VMAX are Basic. This error is independent of card legality or gameplay interpretation.

## Corrected source-derived conditional probabilities

The modeled event is an accepted opening seven containing a Basic, at least one Shadow Rider V found by the end of the first ordinary draw, and at least one VMAX found by the second ordinary draw. Optional mulligan bonuses, when stated, are accepted and available from setup. Six random Prizes are marginalized. All readiness figures below condition on the accepted seven.

| Event | Previously reported (15 Basics) | Correct source (14 Basics) |
| --- | ---: | ---: |
| Valid seven probability (unconditional) | 88.249921% | **86.140932%** |
| Natural T2 readiness, zero bonus draws | 22.552828% | **23.014369%** |
| Natural T2 readiness, one bonus draw | 26.585210% | **27.045324%** |
| Natural T2 readiness, two bonus draws | 30.692213% | **31.145618%** |
| Natural T2 readiness versus four-Basic opponent, average over all optional offers | 28.342548% | **28.733176%** |

The source-counted rank-1 champion (14 Basics) and Temple v1 (15 Basics) figures are unchanged.

### Corrected Hood field-weighted table

The companion [bonus-draw formulas](../../scripts/aichi_bonus_draws.cjs) assume the candidate takes every optional bonus offered by the opponent, capped at 45, retaining two ordinary draws.

| Opponent Basic count | Corrected Hood readiness |
| ---: | ---: |
| 4 | 28.733176% |
| 10 | 24.276582% |
| 11 | 24.043301% |
| 12 | 23.857366% |
| 13 | 23.707418% |
| 14 | 23.585373% |
| 15 | 23.485326% |
| 16 | 23.402867% |

## Method and validation

The exact model uses finite-population inclusion-exclusion, with source inputs 60 cards, 7 opening cards, 6 Prizes, 14 Basic Pokémon, 4 Shadow Rider V, 4 VMAX. The computation was independently reproduced using Python integer binomial coefficients and rational arithmetic, and all relevant stages were cross-checked against the supplied card archive.

The new [manifest-derived regression](../../tests/agent38-hood-basic-source-guard.test.cjs) tests all three fixed inventories and the corrected probabilities; it is included in the [manual statistical CI workflow](../../.github/workflows/aichi-benchmark-stats.yml). The [manual statistical CI 38852448467](https://github.com/FlareZ123/experiment-01/actions/runs/38852448467) passed on 16 October 2026, including the manifest-derived guard.

The prior tests checked the validity of a formula against hard-coded tuples. That did not guarantee the tuples matched the named candidate. Future probability reports should use a manifest-derived input tuple in their tests as well as command-line calculations.

Agent 43 was notified to correct the original result tables and fixtures. These resource probabilities exclude search, Abilities, attack requirements, legal sequencing, opponents' actions and playing policy. **They are not match win probabilities, and the 99.5% objective remains unverified.**
