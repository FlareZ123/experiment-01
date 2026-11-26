# Agent 13 — corrected full-field Fairy Zone / Dragon census

**Date:** 2026-11-26  
**Decision affected:** fixed-60 candidate valuation and the Fairy Zone / Max Geist damage model  
**Status:** static card-text and exact-decklist correction; no deck, policy, fixture, or game changed

## Finding

The 24 November Agent4 Fairy Zone census incorrectly excluded three exact Aichi printings as non-Dragon:

- Dialga-GX UPR 100 — incorrectly labelled Metal
- Koraidon ex TEF 120 — incorrectly labelled Fighting
- Kyurem SFA 47 — incorrectly labelled Water

All three are **Dragon-type Pokémon in the TCG**. The repository's exact English card records say so:

| Aichi printing | Repository card record | HP | TCG type | Printed Weakness |
|---|---|---:|---|---|
| Dialga-GX UPR 100 | `resources/cards/en/sm5.json` · `sm5-100` | 180 | Dragon | Fairy ×2 |
| Koraidon ex TEF 120 | `resources/cards/en/sv5.json` · `sv5-120` | 230 | Dragon | None |
| Kyurem SFA 47 | `resources/cards/en/sv6pt5.json` · `sv6pt5-47` | 130 | Dragon | None |

Independent card references agree: [Dialga-GX UPR 100](https://limitlesstcg.com/cards/UPR/100), [Koraidon ex TEF 120](https://limitlesstcg.com/cards/en/TEF/120), and [Kyurem SFA 47](https://limitlesstcg.com/cards/en/SFA/47). Dialga's attacks cost Metal Energy, but its printed TCG type is Dragon; attack cost is not Pokémon type. Koraidon and Kyurem likewise remain Dragon-type regardless of their attack costs or video-game typings.

This supersedes the type exclusions and the resulting totals in:
- [Agent4's Fairy Zone Dragon weakness census](agent4-fairy-zone-dragon-weakness-value-20261124.md)
- [Agent4's Fairy Zone / Max Geist breakpoints](agent4-fairy-zone-max-geist-breakpoints-20261124.md)
- [Agent4's Fairy Zone lock-overlap census](agent4-fairy-zone-lock-overlap-20261124.md)

An earlier independent nine-set lower-bound census by Agent8 already counted Dialga-GX and rank 30 as Dragon targets ([Agent8 report](../../methodology/2026-11/agent8-source-rank5-fairy-zone-original-field-dragon-targets-20261110.md)); the later exclusion was inconsistent with that result.

## Corrected full-field count

Joining every Pokémon printing in `results/aichi-2026/full-decklists.json` to the exact English card record through `resources/sets/en.json` and filtering on `card.types.includes("Dragon")` gives:

- **14 unique Dragon-type printings**
- **118 Dragon Pokémon copies**
- **13 of the 29 published lists**
- Dragon-target ranks: **1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, 30, 32**

The three wrongly excluded printings account for **27 additional copies** (13 Dialga-GX, 5 Koraidon ex, 9 Kyurem) and add rank 30 to the Dragon-target ranks. The missing source lists remain ranks 23, 25, and 28; their contents are still unknown.

### Complete Dragon target inventory

The energy thresholds below are the minimum integer (E) for Max Geist to KO the printed HP from full health, assuming no other modifiers, no damage reduction/healing, no target-side effective Stealthy Hood, and (for the Fairy Zone column) an active Fairy Zone. Max Geist does (10+30E) damage; against a Dragon target affected by Fairy Zone, the damage is (2(10+30E)).

| Dragon printing | Copies | Ranks | HP | Minimum (E), no Fairy Zone | Minimum (E), Fairy Zone |
|---|---:|---|---:|---:|---:|
| Tatsugiri TWM 131 | 1 | 15 | 70 | 2 | 1 |
| Kyurem SFA 47 | 9 | 10, 12, 13, 14, 18, 20, 21, 27, 32 | 130 | 4 | 2 |
| Radiant Eternatus CRZ 105 | 1 | 1 | 170 | 6 | 3 |
| Dialga-GX UPR 100 | 13 | 1, 10, 12, 13, 14, 18, 20, 21, 27, 30, 32 | 180 | 6 | 3 |
| Regidrago V SIT 135 | 34 | 10, 12, 13, 14, 18, 20, 21, 27, 32 | 220 | 7 | 4 |
| Koraidon ex TEF 120 | 5 | 10, 12, 18, 21, 27 | 230 | 8 | 4 |
| Raging Bolt ex TEF 123 | 2 | 19 | 240 | 8 | 4 |
| Noivern ex PAL 153 | 7 | 12, 13, 14, 20, 21, 27, 32 | 260 | 9 | 4 |
| Hisuian Goodra VSTAR LOR 136 | 5 | 10, 14, 18, 21, 32 | 270 | 9 | 5 |
| Regidrago VSTAR SIT 136 | 27 | 10, 12, 13, 14, 18, 20, 21, 27, 32 | 280 | 9 | 5 |
| Arceus & Dialga & Palkia-GX CEC 156 | 1 | 19 | 280 | 9 | 5 |
| Dragapult ex TWM 130 | 9 | 10, 12, 13, 14, 18, 20, 21, 27, 32 | 320 | 11 | 5 |
| Salamence ex JTG 114 | 1 | 13 | 320 | 11 | 5 |
| Mega Dragonite ex ASC 152 | 3 | 14, 20, 32 | 370 | 12 | 6 |
| **Total** | **118** | **13 ranks** | | | |

### Corrected Max Geist coverage

| Psychic Energy attached across the candidate's Pokémon | Max Geist without Fairy Zone | Max Geist with Fairy Zone | Dragon printings one-hit without / with Fairy Zone | Dragon copies one-hit without / with Fairy Zone |
|---:|---:|---:|---:|---:|
| 3 | 100 | 200 | 0 / 4 | 0 / 24 |
| 4 | 130 | 260 | 0 / 8 | 0 / 72 |
| 5 | 160 | 320 | 2 / 13 | 10 / 115 |
| 6 | 190 | 380 | 4 / 14 | 24 / 118 |
| 11 | 340 | 680 | 13 / 14 | 115 / 118 |

At five Psychic Energy, Fairy Zone therefore reaches **13/14 unique printings and 115/118 copies**, not 10/11 printings. Mega Dragonite ex (370 HP) is the sole remaining miss at five Energy; six Energy reaches all 14 printings. Without Fairy Zone, five Energy one-hits only Tatsugiri and Kyurem in this Dragon target set.

These are printed-HP breakpoints, not a setup probability, an executed attack, or a matchup win-rate estimate. They also do not mean every listed Pokémon is expected to enter play.

## Candidate-side exposure was also undercounted

The fixed candidate `results/aichi-2026/candidate-hood-shadow-rider.json` contains **two Dragon-type Pokémon**:

- Dialga-GX UPR 100 ×1 (180 HP, printed Fairy ×2 Weakness)
- Radiant Eternatus CRZ 105 ×1 (170 HP, no printed Weakness)

The earlier Agent4 reports treated only Radiant Eternatus as the candidate's Dragon target and incorrectly described its Dialga-GX as Metal. Opposing Fairy Zone changes the Weakness of either exposed, unprotected candidate Dragon to Psychic ×2. At three Psychic Energy, Max Geist is 100 base / **200 after Weakness**, enough to KO either target from full HP. The candidate's two Stealthy Hood copies can protect a Dragon target when attached and effective; this report does not assume either target is necessarily on the board or unprotected.

The published opponents with Lillie's Clefairy ex are ranks 1, 5, and 30:

| Rank | Lillie's Clefairy ex | Dragon target(s) in that list |
|---:|---:|---|
| 1 | 2 | Dialga-GX ×1; Radiant Eternatus ×1 |
| 5 | 1 | None |
| 30 | 3 | Dialga-GX ×1 |

### Rank 30 Empoleon V is not a Fairy Zone lock

Rank 30 also contains Empoleon V BST 40 (`Emperor's Eyes`). Do **not** add it as a suppressor of either Fairy Zone source in this matchup. Its text suppresses the opponent's Basic Pokémon **except Pokémon with a Rule Box** ([official Empoleon V card page](https://asia.pokemon-card.com/sg/card-search/detail/1186/)). Both Lillie's Clefairy ex cards have the Pokémon ex Rule Box; Dialga-GX has the GX Rule Box; and Radiant Eternatus has the Radiant Rule Box (the [official rulebook, Appendix 4](https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/svi_rulebook_en.pdf) explicitly says Radiant Pokémon are Rule Box Pokémon). Thus Empoleon V does not suppress either player's Fairy Zone holder or the candidate's Dialga/Radiant Dragon targets. It can suppress other non-Rule-Box Basic Abilities, which is outside this Fairy Zone source/target interaction.

Rank 30 is therefore a Dragon-target rank, contrary to the earlier lock-overlap report. Rank 5 still has no Dragon target in its own list; its own Fairy Zone is separately subject to its Path to the Peak / Field Blower interaction.

## Policy and decision consequences

1. **Candidate Fairy Zone coverage is materially larger than the 24 November census reported.** The 27 omitted copies include 13 Dialga-GX, 5 Koraidon ex, and 9 Kyurem. The 5-Energy / 320-damage threshold covers 115 of 118 listed Dragon copies in the static model.
2. **Opponent Fairy Zone risk to the candidate includes Dialga-GX as well as Radiant Eternatus.** The Dialga copy is a Copycat/Apex payload, but if it is put into play it is a 180-HP Dragon target; discarding it for the payload line is a different state.
3. The current PR #69 worker's `isDragon(slot)` helper reads `slot.printed.types`, and `hasOpponentFairyZoneThreat()` uses that helper for the actor's board. It should recognize Dialga when the native observation carries its exact printed type. The existing direct Hood-search regression uses Radiant Eternatus, not Dialga; add a Dialga-specific positive/negative regression if the frozen policy scope is reopened.
4. Do not change the frozen PR #69 worker, the registered candidate, the V3 fixture, or any game authorization on the strength of this static correction alone. The correction changes the damage/coverage prior, not demonstrated matchup strength or the selected fixed 60.

## Reproduction and limitations

- Source roster: `results/aichi-2026/full-decklists.json` (29 published exact lists; ranks 23, 25, 28 missing).
- Set mapping: `resources/sets/en.json`.
- Exact card records: `resources/cards/en/sm5.json` (`sm5-100`), `sv5.json` (`sv5-120`), `sv6pt5.json` (`sv6pt5-47`), plus the other exact printings listed above.
- Include a printing only when its exact card record's `types` array contains `Dragon`; do not infer TCG type from species typing, attack costs, or card name.
- Fairy Zone text on Lillie's Clefairy ex JTG 56: “The Weakness of each of your opponent's Dragon Pokémon in play is now Psychic. (Apply Weakness as ×2.)”
- No target-side Hood attachment, Stadium/Ability suppression, damage reduction, healing, access probability, board timing, or decision policy was simulated.
- Three missing Aichi lists remain uncounted. No fixed-60 change, matchup result, game sample, or win-rate claim follows.
