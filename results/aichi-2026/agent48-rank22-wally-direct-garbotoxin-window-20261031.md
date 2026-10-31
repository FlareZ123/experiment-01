# Rank 22: exact physically reachable first-personal-turn Wally → Garbotoxin window

**Agent 48, 31 October 2026.** This examines one overlooked alternative in the published original Top32 rank-22 source. It is a mathematically exact **physical access window**, with no native opponent-policy implementation or demonstrated game win.

## Provenance and printed line

The original [rank-22 60](full-decklists.json) records **1 Wally ROS 94**, **2 Trubbish**, **2 Garbodor BKP 57**, and **4 Float Stone**. All 12 other Basic-relevant cards were checked by printed card metadata; **10 other Basic Pokémon** remain after the 2 Trubbish. Its other 41 cards are unrelated to the direct four-part access event. These counts sum to 60.

[Wally's exact text](https://limitlesstcg.com/cards/ros/94), also mirrored on [Pokémon Japan's original Mitsuru card page](https://www.pokemon-card.com/card-search/details.php/card/30931), searches the deck for an Evolution and puts it onto one of your eligible Pokémon, expressly permitting an evolution on your first personal turn or on a Pokémon just played. Therefore a **going-second** original-rank22 player can, in principle, execute:

`place Trubbish → Wally into Garbodor → attach Float Stone → Garbotoxin active`

The ordered steps can differ; the Tool stays attached through evolution. This uses **one Supporter and a Pokémon Tool**, so the Tool is distinct from an Item under modern Pokémon Tool rules. Do not assume Wally bypasses the **going-first** opening Supporter prohibition: its original wording describes the *evolution timing* exemption, unlike newer specifically worded going-first Supporters. The opponent's Item/Ability/Tool disruption and turn order still matter.

The [player-reported rank-22 list registration error](agent48-rank22-registered-wally-original-source-20261031.md) explains why this slot might originally have been intended as Hisuian Heavy Ball. The actual published Wally printing remains the source input.

## Exact opening-seven / six-Prize / one-draw calculation

A uniform random initial seven is accepted only if it includes at least one Basic. After setting six face-down Prize cards, the going-second player draws one normal card. We calculate the event that **Wally, at least one Trubbish and at least one Float Stone** are all in the resulting eight accessible cards, and **at least one Garbodor is still in the remaining deck** for Wally to search.

Physical card categories are `(Wally,Trubbish,Float Stone,Garbodor,other Basic,other)=(1,2,4,2,10,41)`. We sum the multivariate hypergeometric distribution over all valid seven-card hands. For each hand, the exact hypergeometric count of Garbodor in six Prize cards determines whether at least one remains searchable. If exactly one of Wally/Trubbish/Float is missing from the first seven, the sole natural draw must supply that type; if all are already held, drawing the last accessible Garbodor is excluded.

| Measure | Exact probability |
| --- | ---: |
| Basic-valid initial seven | **80.93533073%** |
| Direct event across all shuffled initial sevens | **1.01135852%** |
| Direct event conditional on a Basic-valid initial seven | **1.24958842%** |

This is a narrow direct physical access probability, **not** a 1.25% probability of successfully imposing Garbotoxin lock. It excludes searches from Tapu Lele-GX, Quick Ball, Ultra Ball, prizes retrieved by other means, optional opponent-mulligan bonus draws, and the complete card-play decision policy. It also excludes denial, Supporter contention, a preexisting lock, possible opponent counterplay and card interactions not verified in a native Store replay. The line's existence is real, while AMR and actual matchup value remain unresolved.

## Reproducibility

- Pure CJS exact combinatorial function: [source](../../simulation/evaluation/agent48-rank22-wally-direct.cjs).
- [Two focused tests](../../tests/agent48-rank22-wally-direct.test.cjs): rank-22 numerical constants and a separately hand-enumerated eight-card fixture, whose exact comparison probabilities are **9/14** Basic-valid, **39/1120** event unconditioned, and **13/240** conditional.
- Independent local exhaustive **40,320 distinct physical permutations** on the tiny-deck fixture matched the formula. A separate seeded **3,000,000-shuffle Monte Carlo** of the 60 had **2,427,316 valid starts** and **30,278 direct events** (conditional 1.247386%), consistent with the exact 1.249588% calculation. The Monte Carlo is supporting numerical verification only and has no opponent/game decisions.
- Full original ranked opponent 60 remains unchanged; no playability or actual win-rate claim is made. This study still belongs to the **29/32 original-field, zero-qualified-game** research stage.

**Next decisive test:** native same-root held-Wally/held-Trubbish/Tool geometry under an original rank22 going-second source root; confirm legal Wally resolution and Garbodor Ability activation with real Store and an unchanged opposing deck, including an opponent response. A read-only observer can assess the physical menu first without adding hypothetical native options to the competitive policy.
