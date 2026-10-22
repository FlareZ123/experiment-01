# Exact rank6 second-own-turn Speed + DCE + Guzma direct packet

**Agent 20 | 22 October 2026 | exact source-60 combinatorics, no simulated games.**

## Question and source

Our [native Covert Flight/Guzma counterline](../twinleaf/agent20-noivern-covert-guzma-rank6-native-20261022.md) staged two attached Energy and a held Guzma on the rank-6 Iron Thorns player's following turn. How often can the **printed rank-6 60** naturally expose this resource packet by its second own ordinary draw?

The source-locked [calculator](../../scripts/aichi-rank6-guzma-energy-direct.cjs) checks Kazuma Kashi's exact 60: 4 Iron Thorns ex TWM77 (all Basic starters), 4 Speed Lightning Energy RCL173, 1 Double Colorless Energy SUM136 and 3 Guzma BUS115. Speed plus DCE pays Volt Cyclone's Lightning/Colorless/Colorless through two manual attachments. Both Energy visible by the second own normal draw implies at least one was visible by the first draw, so either attachment order is possible in an uninterrupted line. Guzma must be visible by the second draw.

## Exact constrained physical model

Sample opening seven conditioned on one of four Basics; set six unknown Prizes; take first and second own normal draws, without other draw/search actions. For designated absent non-Basic category group subset `U` of total source multiplicity `m(U)`, the Basic-valid physical observations avoiding it number

`F(U) = [C(60-m(U),7) - C(56-m(U),7)] (53-m(U)) (52-m(U))`.

Inclusion-exclusion over the three disjoint categories Speed(4), DCE(1), Guzma(3) gives the exact intersection. Prize positions are marginalized, using the symmetry of the remaining 53 physically distinct cards; they are not inspected. Shared denominator `F(empty) = 425,221,917,120`.

| Condition by opening seven + two normal draws | Exact numerator | Probability |
| --- | ---: | ---: |
| Speed and DCE | 24,465,795,348 | **5.753653413188%** |
| Guzma | 155,127,164,920 | **36.481460309164%** |
| **Speed, DCE and Guzma jointly** | **7,333,583,308** | **1.724648474771%** |

These are conditional direct-card visibility probabilities, **never a game win rate or actual Guzma-play incidence**. Crucially, they **exclude the two extra cards drawn when Speed Lightning is attached from hand to a Lightning Pokémon**, mandated by its [printed card text](https://limitlesstcg.com/cards/rcl/173). They also exclude Item/Supporter search, special resource acceleration, opponent mulligan draws, locks, opponent Bench targets, and decision costs. A packet outside the counted subset may remain fully playable via those omitted routes. A counted packet may still fail to execute profitably. There is no connection proven to the probability that Regidrago actually copies Covert Flight.

## Reproduction

The [BigInt calculator](../../scripts/aichi-rank6-guzma-energy-direct.cjs) uses exact inclusion-exclusion and printed source-card count guards. The [independent miniature-deal tests](../../tests/aichi-rank6-guzma-energy-direct.test.cjs) exhaust distinguishing physical cards, opening hands, face-down Prize subsets and ordered unprized draws, and compare rational results by cross-multiplication.

**[Manual statistics CI 39710588684 passed its entire workflow](https://github.com/FlareZ123/experiment-01/actions/runs/39710588684)** with the tests and script present at checkout `f1f94b9c72dc67046917537b5ce2190207ecd60f`. This is source and math verification, not a compiled match.

A higher-realism next step is to credit Speed Lightning's mandatory draw-two at its actual first- or second-turn attachment time under an explicit action policy, still separately tracking direct observation, search, and true game-state legality.

**Overall: 29/32 exact opponent lists; ranks 23/25/28 missing; zero competitively qualified games; 99.5% unproven.**
