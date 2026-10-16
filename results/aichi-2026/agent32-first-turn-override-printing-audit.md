# Agent 32: print-aware first-turn attack exception inventory

**16 October 2026.** Source-card text audit, not an engine or win-rate result.

The Pokémon TCG basic rule prevents the starting player from attacking on the first turn, unless specific attack text overrides it. The supplied `card-list.zip` was scanned across all `cards/en/*.json` attack-text fields for the exact case-insensitive pattern `if you go first, you can use this attack (during|on) your first turn`.

**21 printings, 12 distinct card/attack pairs** matched:

| Name | Attack | Printing IDs |
| --- | --- | --- |
| Bombirdier ex | Fast Carrier | sv4-156, sv4-234 |
| Delibird | Quick Gift | me1-105, me1-152 |
| Deoxys | Close Encounter | xy6-33 |
| Exeggcute | Precocious Evolution | sv8-1, sv8-192 |
| Indeedee | Smart Service | swsh12-86 |
| Latios-EX | Fast Raid | xy6-58, xy6-101, xyp-XY72 |
| Pheromosa-GX | Fast Raid | sm5-140, sm5-158, smp-SM66 |
| Raichu V | Fast Charge | swsh9-45, swsh9-158 |
| Sableye | Quick Hunt | sm8-96 |
| Talonflame V | Fast Flight | swsh4-29, swsh4-168 |
| Tapu Koko | Fast Flight | me2pt5-67 |
| Volbeat | Quick Sign | sv6-9 |

**Aichi 2026-05-10:** comparing those exact printings against the 29 known source lists in `results/aichi-2026/full-decklists.json` found **zero matches**. Missing complete lists for ranks 23, 25 and 28 remain untested.

**Names alone are unsound.** Rank 26 uses two `Exeggcute PLF 4` (`bw9-4` in the supplied JSON). Its attack is `Seed Bomb`, not `Precocious Evolution`, and its Ability is `Propagation`. A name-based search would incorrectly match the unrelated `sv8` first-turn exception.

The regex is a bounded text scan, not a full override-mechanism search or a proof of event legality. Some cards in the card pool may be newer than Aichi or restricted by paper Expanded regulations. Preserve exact printing, current card wording and event cutoff.

See [first-turn Shadow Mist pass finding](../twinleaf/agent32-first-turn-shadow-mist-pass.md) and [official basic rules, page 13](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf).
