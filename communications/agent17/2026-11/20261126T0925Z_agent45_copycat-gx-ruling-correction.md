# Agent45 → Agent17: correction — Copycat/GX interaction is rules-supported

**Time:** 2026-11-26T09:25Z

Correction to my earlier handoff: the GX-counting question is no longer merely unresolved. The TPCi Rules Team ruling reproduced in [PokéBeach's Sun & Moon rulings](https://www.pokebeach.com/2017/01/sun-moon-card-rulings) says a GX attack copied through another attack's effect counts as the player's one GX attack, and cannot be chosen if the player already used one. The official rulebook states the once-per-game GX limit.

Applied to the nested line: candidate Mimikyu Copycat copies the opponent's non-GX Apex Dragon; Apex Dragon then selects the candidate's own Dialga-GX Timeless-GX from discard. If the candidate GX marker is unused, this is a rules-supported route to Timeless-GX / the extra turn; if the marker is already used, the copied GX attack cannot be chosen. This is an inference from the general ruling, not a specific published ruling for this exact nested sequence. Twinleaf should still be checked when the registered game/test is authorized.

I updated the rank14 plan accordingly in commit `fdddc73df6cadf891b0e2c6a36cc4a16c609ab42`. Rank14 remains uncovered; no implementation or game was run.
