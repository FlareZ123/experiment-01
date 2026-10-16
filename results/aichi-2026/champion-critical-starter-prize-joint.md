# Joint forced-critical-starter and Prize-rescue capacity

**Agent 1, 16 October 2026.** Exact finite-population calculation on the [published Aichi champion Shadow Rider list](benchmark-shadow-rider.md), with the existing [static Prize-capacity model](../../scripts/aichi-champion-critical-prize-collapse.cjs) as an independently audited marginal. [Manual CI 38861318737](https://github.com/FlareZ123/experiment-01/actions/runs/38861318737) passed the new physical-deal regressions. This is combinatorial source-inventory evidence, **not a game-win result**.

## Question and categories

The rank-1 60-card deck includes **14 ordinary starting-eligible Basic Pokémon**. Two are the singleton Mimikyu GRI and Dialga-GX UPR used in the Copycat -> Apex Dragon -> Timeless-GX counterline. The other twelve Basics are a mix of setup Pokémon, attackers and support. The source contains **one Hisuian Heavy Ball**.

Measure the overlap of two events:

1. **Forced critical starter, F:** the accepted initial seven has one or both of Mimikyu and Dialga-GX but no other Basic Pokémon. A legal start must put a member of this pair into the Active Spot. This is a position/exposure event, not proof the Pokémon is wasted or the game is lost.
2. **Stranded static Prize capacity, R:** among six face-down Prizes, the count of Prized Mimikyu/Dialga-GX is greater than the number of Hisuian Heavy Ball cards outside Prizes. The model optimistically assumes every unprized Ball can eventually be found and used, with no Item lock or other obstruction, and counts only rescue of these two critical cards.

Physical experiment: uniformly deal a seven-card opening from a 60-card deck, exclude seven-card hands with no Basic, then put six random cards from the remaining 53 into Prizes. Active starter is chosen from those Basics, but the event F is defined so every choice must belong to the critical pair.

## Exact outcomes

Every entry is conditional on a valid seven-card opening. Scenarios with 0, 2 or 3 Heavy Balls are hypothetical replacements of **non-Basic, non-critical cards** so that 14 Basic copies stay fixed. They are neither recommended swaps nor feasible full-deck certificates.

| Hisuian Heavy Balls | F: forced critical Active | R: insufficient Prize rescue | Both F and R | F or R |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 6.0431215% | 18.7663408% | 0.6374819% | 24.1719804% |
| **1 (published)** | **6.0431215%** | **2.3669091%** | **0.0533012%** | **8.3567294%** |
| 2 | 6.0431215% | 0.2194919% | 0.0036231% | 6.2589903% |
| 3 | 6.0431215% | 0.0146633% | 0.0001877% | 6.0575970% |

For the source one-Ball list, exact reduced fractions:

- F = **6923 / 114560**;
- R = **139744719 / 5904101632**;
- F and R = **185115 / 347300096**;
- F or R = **1233474499 / 14760254080**.

A compact independent identity checks F:
\`[C(48,7) - C(46,7)] / [C(60,7) - C(46,7)] = 6923/114560\`.
The R marginal agrees *exactly* with the earlier independently developed BigInt [critical-Prize model](../../scripts/aichi-champion-critical-prize-collapse.cjs).

## Validation and reproducibility

The new [joint BigInt enumerator](../../scripts/aichi-copycat-starter-prize-joint.cjs) counts disjoint card categories for the hand and subsequent Prizes. The [regression](../../tests/aichi-copycat-starter-prize-joint.test.cjs) uses an independent physical-slot enumeration of all hands and Prize pairs from an eight-card miniature with 0, 1, 2 or 3 recovery cards, verifying all four joint events. The source-size test checks rational values, the independent original R model and the closed-form F identity. All were green in [manual-only CI run 38861318737](https://github.com/FlareZ123/experiment-01/actions/runs/38861318737) at commit \`02ea79614296972d6a4096995792f78f495ea23a\`. The workflow is [aichi-champion-prize-collapse.yml](../../.github/workflows/aichi-champion-prize-collapse.yml), manually dispatched; no per-commit CI was introduced.

## Interpretation and unresolved tradeoff

With the published one Ball, the event union is 8.3567% of valid openings under this precise static model. Adding a second Ball, hypothetically replacing an unrelated non-Basic, reduces that event to 6.2590%; the reduction comes entirely from R and its overlap. The forced-critical-starter probability remains unchanged because the number and identity of Basic Pokémon remain fixed.

This union is **not** a failure probability, win-rate bound, game-loss probability or complete Copycat-access metric. A forced Mimikyu Active may be perfectly serviceable in some matchups; Dialga-GX Active can potentially be switched or retreated. Likewise, a technically unprized Hisuian Heavy Ball can be inaccessible because of hand, deck, lock, timing or resource constraints. The model excludes opponent mulligan bonuses, recovery other than Heavy Ball, drawing Prize cards after Knock Outs, setup turns, search connectors and actual board tactics. A second Ball consumes a real card slot, so the static risk reduction alone cannot establish that the altered deck is stronger.

For context, the earlier [Bench-entry starter cost](opening-opportunity-cost.md) counts 9.73178% of valid openings where Radiant Eternatus or Tapu Lele-GX is the only type of Basic in hand. That event is **disjoint from F**: no hand can simultaneously have Basics only from the distinct critical pair and only from the Bench-entry group. Thus 15.77490% of accepted hands force an Active from one of these two specified support/payload groups, without implying an equivalent rate of material damage to the game plan. These are different tactical exposure categories.

**Next evidence gate:** simulate legal starts and source-representative responses that turn these opening events into consequential outcomes, including Item-lock timing, Active/Bench management, Prized search chains and GX-copy decisions. Do not use this exact setup census to infer 99.5% game success.
