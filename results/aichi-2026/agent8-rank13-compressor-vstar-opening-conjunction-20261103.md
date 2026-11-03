# Original rank13 Regidrago: exact joint opening resource bottleneck

**Agent 8 | 3 November 2026 | Exact combinatorics, no simulated wins or certified matches**

## Decision question

The previous 24 fresh matched rank13 source-deal groups found zero triggering opportunities for a funded VSTAR's late Quick Ball donor path. One source game reached the funded Active VSTAR and held Battle Compressor without a copied Dragon in public discard. Before commissioning another native card-specific intervention, quantify the physical opening co-occurrence of a Regidrago V, its VSTAR evolution, a discard setup route and enough printed Energy to meet the Grass/Grass/Fire Apex cost in at most two ordinary hand attachments.

This exercise measures **co-occurrence in the initial seven cards only**. It cannot infer whether setup, attack, Item costs, legal targeting, Prize access or opponent response will succeed. The categories deliberately exclude search, extra draws, acceleration, first-player attack restrictions and the official 25-minute clock.

## Exact authenticated 60 and event definitions

The [original rank13 Hiromu Sasaki 60](full-decklists.json) contains 11 Basic Pokémon, comprising four Regidrago V and seven other Basics; three Regidrago VSTAR; two Battle Compressor; three Quick Ball; three singleton evolved Dragon donor cards (Salamence ex, Dragapult ex and Noivern ex); three Double Dragon Energy; four basic Grass Energy; three basic Fire Energy; and 28 remaining cards. The categories partition all 60 physical cards.

All frequencies are conditioned on a Basic-valid opening seven, so the denominator is \`C(60,7) - C(49,7) = 300,306,336\` unordered physical hands.

A *discard route* means holding at least one Battle Compressor, or simultaneously holding Quick Ball and an evolved Dragon donor. Holding Quick Ball and an evolved donor is a potential discard payment, with Basic target and alternative-value conditions unresolved. A *two-manual-attachment energy package* means either two or more Double Dragon Energy, or at least one Double Dragon Energy plus at least one Grass or Fire Energy. This gives a nominal route to Grass/Grass/Fire with two Energy cards, subject to the Double Dragon restrictions and suppressing effects. The extra category *three-basic package* requires two Grass and one Fire with no two-attachment package. It requires three ordinary attachments unless an additional acceleration effect applies.

## Exact counts

| Opening event | Unordered Basic-valid hands | Share of Basic-valid hands |
| --- | ---: | ---: |
| Regidrago V and VSTAR | 44,046,764 | 14.667278% |
| V, VSTAR, Battle Compressor | 7,625,861 | 2.539361% |
| V, VSTAR, Quick Ball and evolved Dragon donor | 2,326,131 | 0.774586% |
| Both discard routes with V and VSTAR | 264,978 | 0.088236% |
| V, VSTAR, either discard route | **9,687,014** | **3.225711%** |
| Previous row and at least one Double Dragon Energy | 1,954,854 | 0.650953% |
| Previous route conjunction and a two-attachment energy package | **751,044** | **0.250093%** |
| Previous route conjunction and three-basic-only energy package | 21,672 | 0.007217% |
| Previous route conjunction and any complete printed colored package | **772,716** | **0.257309%** |

The union was independently checked by inclusion-exclusion: \`7,625,861 + 2,326,131 - 264,978 = 9,687,014\`.

## Interpretation

A hand containing Regidrago V and VSTAR together is markedly more common than a hand that also contains an immediately visible way to get a Dragon into the discard pile. Adding the Energy cards that could meet Apex's colored cost across two manual attachments reduces this already strict co-occurrence to **751,044 / 300,306,336, or 0.250093%**. The separate three-basic-only package contributes **21,672** additional initial hands. These numbers help explain why an isolated Quick Ball or Compressor success is a narrow tactical demonstration and why opening-hand conjunctions are a poor substitute for a genuine sequential planner using Mysterious Treasure, Battle VIP Pass, Professor's Research, Crispin, further draws, Legacy Star, VSTAR evolution and actual discard/search prompts.

The result does **not** say only one in 400 games can attack by the second own turn. Those other cards and subsequent random exposures can create the same lines from many hands excluded here. The denominator consists of physical opening hands rather than independent games; the probabilities are exact for the source card multiplicities and assumptions, not empirical simulator win rates.

## Reproduction and next work

[BigInt category enumeration](../../simulation/evaluation/agent8-rank13-opening-conjunction-dp.cjs) reads the unchanged original source-60 registration and fails closed if the assumed key physical counts change. It enumerates all category count vectors of size seven, weighting each by the product of exact binomial coefficients. [Pure Node regression tests](../../tests/agent8-rank13-opening-conjunction-dp.test.cjs) assert the category partition, the complete event lattice, the union identity and count invariants. No native engine or new CI workload is required for this calculation.

A stronger next native experiment is an **owner-only resource-sequencing planner** that selects real Battle Compressor targets only after the owner's authenticated own-deck prompt, compares alternative uses of Quick Ball and Mysterious Treasure, and records paper-valid costs and downstream copied attacks. The [prior 24-pair null study](agent8-rank13-funded-quickball-prospective24-native-null-20261103.md) and [existing genuine Battle Compressor prompt fixture](../../simulation/twinleaf/newmoon-compressor-owner-prompt-native.cjs) provide focused controls. Any future source experiment must retain fresh predeclared physical-deal cohorts, both seats, a frozen symmetric policy, actual opponent continuation, native trace and paper checks.

**Field objective remains open:** 29 of 32 original opponent printed lists authenticated, no competitively qualified games, no selected fixed 60 and no demonstrated 99.5% win rate.
