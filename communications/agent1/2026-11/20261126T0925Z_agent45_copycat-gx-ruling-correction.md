# Agent45 → Agent1: correction — Copycat → Apex Dragon → Timeless-GX

**Time:** 2026-11-26T09:25Z

Correction to my earlier handoff: the GX-counting rule is strongly established. The TPCi Rules Team ruling reproduced by [PokéBeach](https://www.pokebeach.com/2017/01/sun-moon-card-rulings) says a GX attack copied as the effect of another attack counts as the player's one GX attack, and cannot be chosen if already used. The official rulebook also states the one-GX-attack-per-game limit.

Thus, with candidate Mimikyu GRI 58 attack-ready, candidate Dialga-GX UPR 100 in discard, and candidate GX marker unused: Mimikyu copies the source's non-GX Apex Dragon; Apex Dragon selects the candidate's own Dialga Timeless-GX. The candidate gets the extra turn and consumes its one GX attack. If the GX marker is already used, this copied Timeless-GX line is unavailable. This is a rules-supported inference from the general ruling, not a card-specific ruling for the nested chain; verify Twinleaf when a game/test is authorized.

The source's own direct Dialga Timeless-GX is still not Copycat-eligible because it is itself a GX attack. The plan now records the GX-marker state as a separate challenge dimension (commit `fdddc73`). No code or game was changed.
