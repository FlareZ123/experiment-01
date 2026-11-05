# Original rank-6 Iron Thorns: exact Speed/Thunder alternative payment counterwindow

**Agent 40 | 5 November 2026 | source-locked analytic card-position model; no natural games or competitive win claims.**

## Why this extends the prior result

The original rank-6 Iron Thorns player can potentially Knock Out the separately fixed exploratory Exeggutor/Vileplume v2's 100-HP Exeggutor PLF **on the exposed turn after the challenger uses Bunnelby's double TM Evolution, but before Exeggutor can attack with Blockade**. The original rank-6 staged [Speed Lightning + DCE + Guzma actual Store counter](agent40-rank6-turn3-powered-guzma-counterwindow-20261102.md) has a genuine both-seat KO and Prize-taking certificate, CI **41513450514**. The new [Speed trigger exact correction](agent40-rank6-speed-trigger-window-prize-marginal-20261105.md) improves the narrow physical access model by including its mandatory two extra draws.

That single payment line omitted a second playable attack-cost route available in the **same authenticated original 60**: **Thunder Mountain Prism Star LOT191** removes one Lightning requirement from a Lightning Pokémon's attack. Iron Thorns ex TWM77's printed **Volt Cyclone** costs Lightning + Colorless + Colorless and does 140 damage. Under Thunder Mountain it costs only two Colorless. Hence the following sufficient Energy allocations exist in otherwise unmodified conditions:

- **Speed first turn + DCE second turn**, without needing Thunder. The attached Speed provides Lightning and DCE provides two Colorless.
- **Speed first turn + any other one-unit Special Energy second turn + Thunder**. Thunder eliminates the Lightning requirement; two separate single-unit Energy cards cover two Colorless. The second card may be another Speed, Capture Energy or Spiky Energy.
- **DCE second turn + Thunder**, with no turn-one Speed. DCE alone covers two Colorless after the attack-cost reduction.

The opponent's separate Exeggutor/Vileplume v2 is a five-card modification of Aichi rank-2 original. No change is proposed to either exact original rank-6 or the existing fixed exploratory candidate. None of these resource routes guarantees that the strategic opponent or native policy actually selects the KO.

## Complete original source partition

| Printed original rank-6 card category | Count |
| --- | ---: |
| Iron Thorns ex TWM77 | 4 |
| Speed Lightning Energy RCL173 | 4 |
| Double Colorless Energy SUM136 | 1 |
| Guzma BUS115 | 3 |
| Thunder Mountain Prism Star LOT191 | 1 |
| Other eligible single-unit Energy: 2 Capture RCL171 and 1 Spiky JTG159 | 3 |
| All other | 44 |
| **Total** | **60** |

The source code reads the authenticated [original rank-6 60](../aichi-2026/full-decklists.json) and verifies all category counts, including actual printing IDs; no source card or hypothetical substitute is introduced.

## Physical window and exact disjoint branches

Rank-6 source goes first and opens with seven cards. Six hidden Prize cards are set, then the rank-6 source gets its first normal draw (first **eight** seen cards). Require at least **two Iron Thorns** by that point to put one Active and one Benched, allowing a legal Guzma switch later. Because the eighth card is only a single new draw, two Thorns by the first eight already imply at least one Basic Thorns in the opening seven. All rates below are divided by the legal opening-seven probability **1 - C(56,7)/C(60,7)**.

**Branch A: Speed present among the first eight.** Attach one Speed from hand to a Benched Lightning Thorns on turn one, drawing two from its text. The source sees **eleven** cards by turn three: 7 + 1 + 2 Speed + 1 next ordinary draw. By the eleventh card require Guzma and either (i) DCE or (ii) Thunder and a second one-unit Special Energy in addition to the first Speed. The two options are counted as a union: holdings satisfying DCE are counted only once even when Thunder is also present.

**Branch B: no Speed among the first eight.** Without that turn-one draw trigger, the source sees only **nine** cards by turn three (7 + 1 + 1 normal draws). Require Guzma, DCE, and Thunder among those nine. No turn-one Energy attachment is needed. This branch is disjoint from Branch A by construction.

| Disjoint, exact card-location event | Fraction, conditional Basic-valid opening | Probability |
| --- | --- | ---: |
| A1: early Speed, Guzma + DCE by card 11 | 85318412819 / 22589914347000 | **0.377683649032%** |
| A2: early Speed, Guzma + Thunder + second single-unit Energy by 11, **no DCE by 11** | 9138016033 / 5647478586750 | **0.161807006306%** |
| **Branch A total** | **40623492317 / 7529971449000** | **0.539490655338%** |
| **Branch B:** no early Speed, Guzma + Thunder + DCE by card 9 | **1207121 / 2310988680** | **0.052233964210%** |
| **Union of A and B** | **66835042363 / 11294957173500** | **0.591724619548%** |

The union's unconditional physical-deal probability is **66835042363 / 28272760337250 = 0.236393764053%**. This narrow resource-position union is **2.7536621227 times** the original 0.214886428759% no-Speed-bonus single-payment screen. The larger number is still extremely far from a match win estimate.

## Validation and engine status

An exact multivariate hypergeometric enumerator computes the first-eight category composition followed by the conditional extra-draw group. Seven disjoint printed categories use integer binomial weights; all Prizes are marginalized over the uniformly random original 60. Branch A has denominator **C(60,8)·C(52,3)** and Branch B **C(60,8)·C(52,1)** before legal-opening conditioning. Their rates are added as disjoint fractions.

Code: [source-locked CommonJS enumerator](../../simulation/evaluation/agent40-rank6-thunder-speed-payment-window.cjs), reusing the independent basic rank6 Speed sampler. [Proposed pure test suite](../../tests/agent40-rank6-thunder-speed-payment-window.test.cjs) asserts the exact source percentages and independently brute-enumerates a nine-card miniature, whose fast/slow/union conditional fractions are **11/120, 3/160, and 53/480** respectively. All stated exact source fractions and toy exhaustive values were also independently calculated using Python \`fractions.Fraction\`, \`math.comb\`, and physical-card ordered permutations. The test was added to the existing **manual-dispatch-only** \`aichi-benchmark-stats.yml\`; **GitHub Actions execution remains unverified**, because the attempted manual dispatch was blocked by tool safety checks.

The supplied English complete card pool independently confirms Speed's printed two-card Lightning attachment trigger, Thunder's one-Lightning discount, the DCE two-unit effect, and Iron Thorns's Lightning+Colorless+Colorless attack cost. Read-only inspection of **pinned upstream Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05** located \`ptcg-server/src/sets/09-sword-and-shield/set-rebel-clash/speed-lightning-energy.ts\`, which checks an \`AttachEnergyEffect\` and a Lightning target before \`MOVE_CARDS(..., count: 2)\`; and \`ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/thunder-mountain-prism-star.ts\`, which removes one Lightning symbol in \`CheckAttackCostEffect\` if the Stadium effect is active. These are **source-code implementation observations**, and do not constitute a compiled native Store certificate for the new Thunder or Speed bonus path.

## Strategic interpretation and limitations

This event explicitly models **resource arrival deadlines and mutually exclusive payment choices** rather than naïvely adding search-card probabilities. It leaves out almost all realistic gameplay: held other possible attackers, other acceleration, Top-4 Trainers' Mail or other Item search if legal, voluntary Supporter choice, opponent Item/Supporter locks and Stadium replacement, hand discards, opponent mulligan extra draws, source turn-one bench decisions, opponent offensive pressure, exact source win condition, actual Prize reveal after searches, and tournament clock. The original rank-6 may be under an opposing Vileplume AOR Item lock by turn three; Speed/Thunder/Guzma and ordinary Energy attachment themselves are non-Item actions, but this study does not certify that all those cards can be used under *every* board lock.

For full credibility the study needs an actual native both-seat Speed draw-two fixture, Thunder alternative with real Store payment and post-attack Energy movement, a source-dealt owner-visible root-selection policy, and a genuine opposing response. This calculation does not qualify the Exeggutor candidate or select any final 60.

**Global benchmark remains 29/32 authenticated original 60-card names/counts, ranks 23/25/28 absent, zero competitively qualified games, no established 99.5% win rate.**
