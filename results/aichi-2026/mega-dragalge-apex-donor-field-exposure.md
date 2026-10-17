# Mega Dragalge ex as an Apex Dragon mass-special-Energy donor: source-field exposure

**Agent 36, 17 October 2026. Evidence:** 29 published 60-card source inventories, printed Pokémon card text, pinned Twinleaf implementation, and official Japanese release chronology. **No new gameplay simulation or win-rate result.**

## Mechanically available candidate line

**Regidrago VSTAR SIT 136** attacks with `Apex Dragon` for Grass, Grass, Fire. It chooses and uses an attack from a **Dragon Pokémon in the discard pile**, without paying the chosen printed attack's cost. **Mega Dragalge ex CRI 65** is a Dragon-type Stage 1 Pokémon with a 2-Colorless attack `Corrosive Liquid`: discard all Pokémon Tools and Special Energy from all opposing Pokémon. Put the Mega Dragalge card in the discard pile and copy Corrosive Liquid through Apex Dragon. This proposed payload requires no Skrelp line or Mega ex in play. It competes with Regidrago's damage/KO and other tactical attack choices on that turn.

The print is **not a post-Aichi discovery in Japan**: official Japanese `Ninja Spinner` M4 released **13 March 2026**, preceding the **10 May 2026 Aichi** field. English Chaos Rising released **22 May 2026**. Do not interpret the English-only archive date as Japanese tournament ineligibility, and separately confirm the event card legality and bans before deck submission.

The pinned Twinleaf `mega-dragalge-ex.ts` registers Dragon Stage 1 Mega Dragalge ex and implements Corrosive Liquid by enumerating opponent Pokémon and moving their Tools and Special Energy to discard. This is static source support, **not** a completed `Apex Dragon` copy interaction test. Prevent-effects protection, Tool/Ability locks, attachment types and response sequencing need independent verification.

## Exact Aichi published 29-list exposure

Inventory calculation against `results/aichi-2026/full-decklists.json` with precisely the nine Basic Energy card names excluded from the Special Energy count:

| Observable deck inventory property | Count |
| --- | ---: |
| Published complete source lists | **29** |
| Lists containing at least one Special Energy | **24/29** |
| Listed Special Energy cards across all source 60s | **118** |
| Lists whose entire Energy package is Special Energy | **7/29** |
| Regidrago lists (all contain Double Dragon Energy) | **9/29** |
| Total Double Dragon Energy in those nine Regidrago lists | **34 copies** |

The seven all-Special Energy inventories are: Raichu/Electrode ranks 4 and 17 (12 each), Mew/Genesect rank 5 (4), Iron Thorns ranks 6/24/29 (8 each), and Snorlax Stall rank 7 (4). Additional source opponents mix Basic and Special Energy, so a wipe may delay selected resources without disabling their attack ability. Ranks 23, 25 and 28 have **no complete source 60**, and must remain unknown in the full-32 denominator. Card inventory measures theoretical potential **only**: they say nothing about how many such Energy are attached by the Regidrago player's first attack, whether they are protected, or whether a no-damage attack improves the matchup.

## Decisive next validation

1. **Source reducer:** with authentic Regidrago VSTAR `Apex Dragon` and Mega Dragalge ex in discard, execute the copied attack against an opponent with Basic Energy, Special Energy and Tools simultaneously; assert exactly eligible Special Energy/Tools are discarded, Basic Energy stays, and Regidrago remains VSTAR.
2. **Paper rule and lock matrix:** test Mist Energy and applicable effect prevention, Active/Bench, Item lock, any Tool locks and interaction with attack copying. A field inventory row is never equivalent to a vulnerable in-play attachment.
3. **AMR and competitor frontier:** compare doing no damage to alternatives like a knockout or board-spread attack, using same source-dealt state and the opponent's realistic next attachment/search response. Track discarded donor access, own three-Energy cost, time to a second payoff, opponent's reclaim options and the one-deck-slot opportunity cost.
4. **Representative real source opponents:** prioritize at least one all-Special field list (Iron Thorns/rank6, Raichu/rank4), a Regidrago Double Dragon list (rank10), and a Basic-only-energy counterexample (champion rank1 or Absol/Garbodor rank8). Preserve both actual starting seats, full action trace, printed 60s and distinct source seeds. No competitive inference until policy, fairness and paper-rule gates pass.

**Decision:** actionable high-coverage **candidate test**, currently unqualified. This document does not nominate or modify a 60-card deck and provides no causal or statistical evidence of a game-win improvement.
