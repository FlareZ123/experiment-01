# Agent 37: rank-11 New Moon's unpowered 14-card hand, constrained response alternatives (3 November 2026)

**Read-only native evidence.** Same original-source [Agent22 CI 41581276542](https://github.com/FlareZ123/experiment-01/actions/runs/41581276542), artifact 13205777405, seed **2171744612**, trial `11:0:A:new-moon-lockbreaker-v1`, source Mega Absol seat1 versus New Moon candidate seat0. Complements [the four Counter Catcher windows](agent37-rank11-countercatcher-pass-structural-audit-20261103.md).

At the first post-Claw candidate root, T32, **neither the candidate's Active Unown nor any of its five Benched Pokémon had an Energy card**. Its actual **14-card hand also had zero Energy cards**. The opposing Active Mega Absol ex held **three Darkness Energy** and had 80 damage. Candidate still had six Prizes; source had five after the previous Claw. Candidate Benched Squawkabilly ex, then passed; it later passed T34, T36, T38 with equally unpowered public boards and no Energy in its retained 14-card hands. Four Claw-follow-up windows are **one native game**, not four samples.

The frozen New Moon candidate's published 60 contains **three Telepathic Psychic Energy and three Basic Psychic Energy**, six total. At least one Psychic Energy was genuinely played by candidate on T16. By T32 that Energy was no longer attached to its board. How many of the other five accessible Energy cards remain in the unknown deck versus Prize or discard is **not established by the public Pass snapshot**.

This reveals a different missing policy dimension from hand-size-only draw metrics. The hand was large in card count yet empty of immediate Energy resources, with the owner board unpowered. Specifically, it held:

- **Lillie's Determination M1L**: printed shuffle-then-draw **8** when six Prizes remain. A 14-card owner hand would shuffle its 13 other cards into the deck, leaving sufficient physical cards for eight draws even if the deck were temporarily short.
- **Ace Trainer AOR**: printed behind-on-Prizes condition was structurally satisfied at T32; shuffle both hands, owner draws six, opponent draws three. The opponent's hand composition is hidden and the disruption benefit has not been measured.
- **Forest Seal Stone SIT**: candidate had Benched **Galarian Articuno V**, an eligible Tool host on the public board; the Tool's VSTAR Power Star Alchemy can search one card if that power remains unused and legally usable. Native Tool attachment, use marker and search legality require a live Store test.
- **Counter Catcher PAR**: source had three Benched Pokémon and candidate more remaining Prizes, but gust may only temporarily slow a fully funded Active Mega Absol and provides no Energy by itself.

**Illustrative mathematical sensitivity, not a replay statistic.** If the candidate has 25 cards in its deck *before* playing one of the shuffle Supporters and 13 non-Energy cards returned from hand, the shuffled deck has 38 physical cards. If exactly K accessible Energy cards are in that final deck, the probability of finding at least one by drawing n is `1 - C(38-K,n)/C(38,n)`:

| Accessible Energy K | Lillie draw 8 | Ace Trainer draw 6 |
| ---: | ---: | ---: |
| 0 | 0.0% | 0.0% |
| 1 | 21.1% | 15.8% |
| 2 | 38.1% | 29.4% |
| 3 | 51.9% | 41.2% |
| 4 | 62.9% | 51.3% |
| 5 | 71.6% | 59.9% |

Assumed deck size and K are **hypothetical**. This table does not include costs, revealed Prize information, future turns, opposing response, dominance by a precise VSTAR search, or the chance the deck contains a useful attacker. It only shows why a low-hand-only draw heuristic can miss a meaningful action when an unpowered board is about to lose.

**Priority for the native same-source fork:** inspect real T32 Store `canPlay` for Lillie, Ace Trainer, and Forest Seal Stone, with authenticated owner VSTAR use marker; use already available Counter Catcher as a tempo comparison. Separate an optional search being accessible from the exact Energy being available, the legality and the actual impact on the following source attack. Keep the control Pass and all censored/failed arms. No qualified winner can be inferred. Field coverage still 29/32, competitive game qualification zero.


## Frozen-policy gating clarification from the original raw trial

The exact trial `11:0:A:new-moon-lockbreaker-v1` records `actorOnlyDecisionCoverage.ownerShuffleSupporterRootOptIn=false` and `ownerSupporterOpportunityOptIn=false`. It also records `ownerCompressorPayloadOptIn=false`, `ownerCompressorLate14OptIn=false`, `ownerCompressorAnyTurnOptIn=false`, and `ownerCompressorBenchedOptIn=false`. Thus the frozen evaluated policy had **not enabled** these owner shuffle/compressor response pathways at all. The conservative three-card-hand rule in the existing independent shuffle module would be an additional barrier **if its module were enabled**, but cannot be claimed as the sole or actual reason for this archived Pass. The demonstrated result is missing policy coverage under the archived frozen options. Native legality and tactical benefit of any newly enabled action remain unknown.

