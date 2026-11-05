# Rank-6 Speed Lightning draw-two: exact early Guzma counterwindow

**Agent 40 | 5 November 2026 | source-locked, analytic resource-position result | zero competitively qualified games.**

## Decision relevance

The original Aichi rank-6 Iron Thorns ex 60 can, under a separately demonstrated staged native scenario, use an already Speed-funded Benched Iron Thorns, attach the singleton Double Colorless Energy, gust the experimental Exeggutor PLF attacker with Guzma, and Knock Out Exeggutor with Volt Cyclone **before its first Blockade**. The both-seat staged Store certificate is [Agent40's rank-6 counterwindow report](agent40-rank6-turn3-powered-guzma-counterwindow-20261102.md) and native CI **41513450514**, with the crucial limitations that the original turn-one Speed attachment and opponent board were constructed.

The existing exact source-only physical-card screen deliberately excluded the two extra cards drawn by Speed Lightning Energy, reporting **14277253 / 6644092455 = 0.21488642875906516%** conditional on a Basic-valid opening seven. Since the printed Speed Lightning Energy RCL173 specifically draws two cards when attached from hand to a Lightning Pokémon, and Iron Thorns ex TWM77 is Lightning, those extra cards can materially change access to DCE and Guzma before the second source turn. This report quantifies that **narrow incremental card-location effect**, without claiming actual root execution or player win rate.

## Exact event and source

The authenticated [original rank-6 printed 60](../aichi-2026/full-decklists.json) supplies these mutually exclusive physical categories:

| Original printed copies | Count |
| --- | ---: |
| Iron Thorns ex TWM77 (all starting Basics) | 4 |
| Speed Lightning Energy RCL173 | 4 |
| Double Colorless Energy SUM136 | 1 |
| Guzma BUS115 | 3 |
| All other cards | 48 |
| **Total** | **60** |

Original rank6 is going first. The event requires at least **two Thorns and one Speed** among the first eight normally observed cards (seven-card opener plus first turn's normal draw), so one Thorns can start Active and the other can be Benched and receive Speed on that turn. Because there are two Thorns by card eight, at least one necessarily was in the opening seven: the event implies Basic-valid opening. We condition on that legal-opening event anyway to remain comparable with the earlier screen.

Assume the first turn's Speed Lightning Energy is attached from hand to the Benched Lightning Thorns, drawing its two printed bonus cards. Take the subsequent turn's ordinary draw. Then a total of **eleven** cards have been observed by the original source player: 7 initial + 1 turn-one draw + 2 Speed-triggered draws + 1 second-turn draw. The event further requires that **both the one DCE and at least one Guzma** occur among those eleven. The DCE can then be attached on the second turn and Guzma can be played on that turn, subject to other unmodeled conditions.

As usual, six face-down Prizes are physically dealt *after* the opening seven. Since no Prize identity is inspected or conditioned on, the ordered sequence of the eleven accessible draw slots, marginalized over uniform Prize cards, is distributed as an ordered eleven-card sample without replacement from the original 60. This is why the six Prizes need no separate enumeration in this particular unobserved-Prize calculation; a priced DCE or Guzma cannot occur in the accessible eleven slots.

## Exact result

| Extra Speed draws included | Later-card window after first eight | Conditional Basic-valid-seven chance |
| --- | ---: | ---: |
| 0, previous baseline | 1 | **14277253 / 6644092455 = 0.214886428759%** |
| 1, diagnostic intermediate | 2 | **1316861033 / 451798286940 = 0.291471010640%** |
| **2, full printed Speed trigger** | **3** | **85318412819 / 22589914347000 = 0.377683649032%** |

For the two-bonus-draw event, the **unconditional** initial-random-deal probability is **85318412819 / 56545520674500 = 0.150884476438%**. The exact probability of the first-eight Thorns+Speed staging resources alone is **201661 / 2654982 = 7.595569386158%**, conditional on Basic-valid opening. Among those early-resource-conforming cases, the exact chance of DCE+Guzma arriving within the full eleven-card window is **85318412819 / 1715832618500 = 4.972420497145%**.

The full draw-two physical opportunity is **1.7575965649 times** the old no-extra-draw result, about a **75.76% relative increase**. This is a source-hand access comparison, not an incremental chance of a Knock Out. In particular the old and new events overlap, with the new event containing the old event.

## Derivation, verification, and reproducibility

An exact multivariate combinatorial enumerator counts every first-eight category composition with Thorns >=2 and Speed >=1, then every additional one-, two- or three-card composition satisfying total DCE >=1 and Guzma >=1. Each composition is weighted by a product of binomial coefficients, without replacement. The unconditional denominator for the full eleven-card window is:

C(60, 8) * C(52, 3).

For conditional Basic-valid opening, divide by:

1 - C(56, 7) / C(60, 7).

The complete category enumerator is [simulation/evaluation/agent40-rank6-speed-trigger-counterwindow.cjs](../../simulation/evaluation/agent40-rank6-speed-trigger-counterwindow.cjs); it reads and validates the exact registered rank-6 original from [full-decklists.json](../aichi-2026/full-decklists.json). The companion [CommonJS tests](../../tests/agent40-rank6-speed-trigger-counterwindow.test.cjs) assert all three exact source fractions, check an independently brute-enumerated tiny physical-card permutation universe, and reject the no-DCE event.

**Independent non-repository computation completed:** two separate Python exact-\`Fraction\` implementations reproduced the final fraction \`85318412819/22589914347000\`, one through two-window combinatorial enumeration and the other through inclusion-exclusion for a DCE/Guzma hit in the remaining 52-card sample after each eligible first-eight category group. The earlier published baseline fraction was also independently recovered by substituting a one-card late window. **Do not describe the new CommonJS test as GitHub Actions green:** it was added to the existing **manual-only** \`aichi-benchmark-stats.yml\` test job, but the attempted workflow dispatch was refused by tool safety checks on 5 November and no compiled CI test has been observed.

The independent card-text basis is Speed Lightning Energy RCL173: “When you attach this card from your hand to a Lightning Pokémon, draw 2 cards.” The user-supplied complete card pool has this English text in \`cards/en/swsh2.json\`; the public official card database also describes the same draw-two trigger. No new native Store test for the Speed attachment and actual bonus draw was performed in this follow-up.

## Limits and next bottleneck

The result **does not count actual source-policy choice**, starting-spot decision quality, GX/lock effects, payment priority, source opponent Bench choices, attacks, opponent survival, draw Abilities, searches such as Trainers' Mail or Guzma & Hala, Speed energy's tactical use elsewhere, mulligan bonuses, candidate-derived starter/Prize coupling, or the opponent's exact Vileplume/Exeggutor development. A favorable location sequence can still fail to execute; other resources and search channels can enable the same counter despite failing the narrow event. The constructed native Knock Out and this probability **cannot be multiplied** into a game-winning probability.

The next meaningful test would start from a natural exact original rank-6 source deal, select a legal first-turn Speed-on-Bench attachment through owner-only information, settle both real draws, then retain all source decisions and permit an original rank2-derived candidate to develop and respond. Fairly registered both-seat, error-inclusive full games with meaningful opponent policy and paper legality remain absent. The broader Aichi field still has **29/32 authenticated original 60s, zero competitively qualified games, and no selected final deck or 99.5% proof**.
