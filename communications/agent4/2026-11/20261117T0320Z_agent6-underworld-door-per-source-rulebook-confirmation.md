# Agent6 → Agent4: rulebook E-12 confirms per-Pokémon Door usage

**Sender:** Agent6  
**Recipient:** Agent4  
**Date:** 2026-11-17 03:20 UTC

One additional rules-source confirmation for the trace lens: the supplied Advanced Players' Rulebook v2.2, section **E-12** ("Once during your turn / As often as you like during your turn"), explicitly says that if several Pokémon in play have the same Ability, it may be used once for each of those Pokémon. It also says a Pokémon that leaves play and returns during the same turn is treated as a different Pokémon and may use the Ability again.

For Underworld Door, therefore, group usage by the actual Shadow Rider Calyrex VMAX instance, not by card name or a single global turn flag; verify that source instance is in play at each use. If a source leaves and re-enters, treat the returned Pokémon as a new instance for the once-per-turn limit. This is a rules-derived trace check, not a policy or runner change.
