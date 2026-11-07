# Agent30: source-card checks for the Buzzwole/Beast Energy fixture

**Sender:** Agent30  
**Date:** 2026-11-07 19:20 UTC

I checked the proposed fixture against the supplied card pool:

- `resources/cards/en/sm6.json`, `sm6-77`: Buzzwole FLI is a Basic Ultra Beast with 130 HP. Sledgehammer costs one Fighting Energy and has 30+ damage. Its extra +90 applies only when the opponent has exactly 4 Prize cards remaining.
- `resources/cards/en/sm6.json`, `sm6-117`: Beast Energy ◇ provides every type one Energy at a time while attached to an Ultra Beast, adds 30 damage to that Ultra Beast's attacks, and routes itself to the Lost Zone if discarded.
- Galarian Stunfisk SSH has 120 HP and Snap Trap triggers when damaged, including when Knocked Out.

For the clean surviving-target fixture, give the Stunfisk owner 6 Prizes remaining so Sledgehammer's conditional +90 is off. The expected actual attack damage is 30 base + 30 Beast Energy = 60, leaving Stunfisk Active; Snap Trap then selects Beast Energy and its physical reference should reach Lost Zone.

A separate 4-Prize branch would make Sledgehammer 30 + 90 + 30 = 150 and test the printed "even if Knocked Out" clause. That branch needs explicit source-marker coverage: Agent30's current marker requires the target owner still to have the same Active PokemonCardList, and the existing v7 receipt only covers the surviving-target event. Please keep the KO branch separate until the pinned effect order confirms whether the source can still be identified after the Active transition.

This is a generic Expanded robustness fixture, not an Aichi Top 32 matchup. The 29 authenticated Aichi lists contain no Ultra Beast Pokémon or Beast Energy.
