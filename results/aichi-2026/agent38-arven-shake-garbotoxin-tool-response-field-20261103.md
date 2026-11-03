# Opponent Tool removal against early Garbotoxin: exact Aichi source census

**Agent 38 | 3 November 2026.** Static print-aware inventory study of the 29 authenticated exact original Aichi Open League 2026 Top32 decklists. **No games played, card availability or positive counterplay verified.** Full benchmark remains 29/32 originals and zero competitively qualified games.

## Why this counter matters to Arven Shake Absol

The [new Arven Shake Absol v1](candidate-arven-shake-absol-v1.json) tries to establish Garbodor BKP 57 with Float Stone BKT 137 by using Arven SVI 166 and Boost Shake EVS 142 early. Garbotoxin's printed wording checks **whether the Garbodor has a Pokémon Tool attached**, then suppresses all Abilities except Garbotoxin across players' Pokémon in play, hands and discard. An opposing Item or Supporter that removes that attached Tool can terminate the Ability lock and recover a previously unavailable source line. Tool removal must still be obtained, playable, targeted and chosen by a competent opponent.

From the supplied English card pool, the following *exact printed* cards can remove an opposing Tool attached to a Benched Garbodor:

- **Field Blower GRI 125** (Item): discard up to two chosen Pokémon Tools or Stadiums in play; no explicit hand-discard fee.
- **Lost Vacuum LOR 162** (Item): put another card from hand in the Lost Zone as a mandatory cost, then put a chosen attached Tool or Stadium in the Lost Zone.
- **Megaton Blower SSP 182** (ACE SPEC Item): discard all Pokémon Tools and Special Energy attached to the opponent's Pokémon, plus a Stadium.
- **Faba LOT 173** (Supporter): send an opposing attached Tool or Special Energy, or a Stadium in play, to the Lost Zone; consumes the player's Supporter.

These mechanisms occupy materially different resource channels. In particular, Faba consumes a Supporter and Lost Vacuum has an owner-hand cost. If Vileplume or another Item lock is live, Item answers may be unavailable. A native actor accepting an Item is still insufficient to establish strategic effect or paper legality.

**Tool Jammer BST 136 is deliberately separate.** Its Tool effect nullifies opposing Active Pokémon's Tool effects while the Jammer's holder is Active. A Pokémon Tool remains *attached* while its effect is nullified. Therefore a Tool Jammer can turn off the free-retreat effect of an opposing Active Garbodor's Float Stone, potentially trapping it, **without disabling Garbotoxin by itself**. Garbotoxin checks the presence of an attached Tool, and neither Tool Jammer nor Jamming Tower removes that attachment. Whether other Active-control or Ability suppression effects intervene requires separate verification.

## Authentic source inventory: 20 of 29 have at least one of the four direct answers

**20/29** known exact original lists contain at least one of those four Tool-removal printings. There are **30 physical copies** across the known 29 source lists: **11 Field Blower, 1 Lost Vacuum, 10 Megaton Blower, 8 Faba**. The nine authenticated ranks without any of the four are **4, 9, 11, 15, 16, 17, 18, 26 and 27**. Absence from this four-card census does not prove no other Tool-removal or counterplay line exists.

| Original rank | Source archetype | Direct Benched-Tool removal printings | Tool Jammer |
| ---: | --- | --- | :---: |
| 1 | Shadow Rider Calyrex | 1× Field Blower GRI 125 | No |
| 2 | Vileplume Control | 1× Faba LOT 173 | No |
| 3 | Snorlax Stall | 1× Faba LOT 173 | Yes |
| 4 | Raichu Electrode Combo | None of the four | No |
| 5 | Mew Genesect | 1× Field Blower GRI 125; 1× Lost Vacuum LOR 162 | No |
| 6 | Iron Thorns | 1× Megaton Blower SSP 182; 1× Faba LOT 173 | Yes |
| 7 | Snorlax Stall | 1× Field Blower GRI 125; 1× Megaton Blower SSP 182; 2× Faba LOT 173 | Yes |
| 8 | Absol Garbodor | 1× Field Blower GRI 125 | No |
| 9 | Absol Electrode | None of the four | No |
| 10 | Regidrago | 1× Faba LOT 173 | No |
| 11 | Absol Garbodor | None of the four | No |
| 12 | Regidrago | 1× Megaton Blower SSP 182 | No |
| 13 | Regidrago | 1× Megaton Blower SSP 182 | No |
| 14 | Regidrago | 1× Megaton Blower SSP 182 | No |
| 15 | Lopunny Vileplume | None of the four | No |
| 16 | Absol Garbodor | None of the four | No |
| 17 | Raichu Electrode Combo | None of the four | No |
| 18 | Regidrago | None of the four | No |
| 19 | Raging Bolt | 1× Field Blower GRI 125 | No |
| 20 | Regidrago | 1× Megaton Blower SSP 182 | No |
| 21 | Regidrago | 1× Megaton Blower SSP 182 | No |
| 22 | Absol Garbodor | 1× Field Blower GRI 125 | No |
| 24 | Iron Thorns | 1× Megaton Blower SSP 182; 1× Faba LOT 173 | Yes |
| 26 | Meloetta Donk | None of the four | No |
| 27 | Regidrago | None of the four | No |
| 29 | Iron Thorns | 1× Field Blower GRI 125; 1× Megaton Blower SSP 182; 1× Faba LOT 173 | Yes |
| 30 | Lillie's Clefairy | 3× Field Blower GRI 125 | No |
| 31 | Dusknoir Chimecho | 1× Field Blower GRI 125 | No |
| 32 | Regidrago | 1× Megaton Blower SSP 182 | No |

Rank 7 has four direct answer copies (two Faba, one Field Blower, one Megaton Blower); rank 30 has three Field Blower. Rank 29 combines Faba, Field Blower and Megaton Blower. These are *registered-card slots*, not the probability a player actually finds or uses them.

The fixed challenger has four Float Stone Tools and two Garbodor. That may provide ability to re-establish a Tool lock after an opponent removes one, but the relevant Tool search, recovery, Bench positions, timing and follow-up must be demonstrated under the same policy. An opponent may also choose to damage or gust an exposed Garbodor instead of using Tool removal.

## First-turn Bench opportunity is materially narrower

The [exact one-draw hybrid resource model](../../scripts/agent38-arven-shake-one-draw.cjs) also distinguishes visible resources enabling a Tool-equipped **Benched** Garbodor without an extra Switch or replacement effect. One of the initial-seven Basics must start Active; a Benched Trubbish is physically available if a second Trubbish is visible by the first ordinary draw, or if a non-Trubbish Basic was in the actual starting seven.

| Restricted opportunity given Basic-valid opening seven | Original rank-11 | Arven Shake v1 |
| --- | ---: | ---: |
| Complete direct/Arven-assisted hybrid resource access, any Garbodor position | **1.938316%** | **16.755733%** |
| Same plus naturally available Benched Trubbish | **1.177998%** | **11.496088%** |

For the challenger the exact naturally Benched hybrid numerator is **38,773,084,292,118,487** over **416,717,869,162,795,200** total weighted first-seven/draw/six-Prize configurations, and the valid-opening denominator is **337,271,985,613,442,880**. The difference of about **5.259645 percentage points** is resources that appear available only with a potential Active Trubbish under this strict no-Switch placement model. It does **not** say the remainder cannot establish Garbotoxin, since an Active Garbodor also has Garbotoxin and may retreat later; it measures a positional resource option, not competitive viability.

## Reproducibility and bounded conclusions

- [Exact source counterplay census CJS](../../scripts/agent38-garbotoxin-tool-counter-census.cjs) enumerates only the four print-aware card identities and isolates Active-only Tool Jammer.
- [Five regression tests](../../tests/agent38-garbotoxin-tool-counter-census.test.cjs) include 29 authentic printed 60s, exact ranks, aggregate copies, malformed/duplicate source guard and a Tool-Jammer-only synthetic roster.
- [Eight independent one-draw resource tests](../../tests/agent38-arven-shake-one-draw.test.cjs) independently enumerate a small physical toy with actual initial-seven/draw/Prize ordering, including natural Bench availability.
- All thirteen tests passed when unchanged GitHub source was evaluated with an isolated V8 Node-test/assert shim. The earlier seven opening-only tests passed locally under Node22. **No compiled Twinleaf CI, autonomous opponent turn, paper-legal payment chain, match or win rate is demonstrated.**

The high Tool-answer incidence is a **candidate risk and prioritized adversarial response target**. A meaningful next release would present the same actual source deal where the candidate establishes a Tool-equipped Garbodor and challenge the opponent at its first consequential root: Pass or ordinary setup versus a *paper-eligible actual Tool removal*, including payment, source recovery, the next attacking turn and any retooling of Garbodor. Test rank7/rank29 high-answer and rank30 three-Field-Blower originals alongside rank1/rank5/rank11 to avoid favorable cherry-picking. Use the actual selected symmetric policy, preserve the original Pass path and all failed/capped branches. Only complete qualified games against all 32 original opponents support the 99.5% objective.
