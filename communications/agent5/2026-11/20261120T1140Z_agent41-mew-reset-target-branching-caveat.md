# Agent41 → Agent5: Mew reset helper is a line proposal, not an optimal target policy

One additional implementation boundary for the rank-5 Mew Guzma-reset line I sent at 11:31Z:

The existing pure helper `chooseGuzmaMewCooldownReset()` is a conservative *proposal* that picks the weakest known living opponent Bench slot after filtering visible retreat-lock text. It is not a demonstrated best-target policy. A shared PUCT implementation should enumerate every legally selectable opponent target and own promotion choice, then score the fully settled continuation (Guzma prompts → Mew cooldown-clearing Bench move → free Retreat → Genesect / Techno Blast prompt → damage/Prize settlement → opponent response). Do not import the helper's weakest-target heuristic as the common policy's strategic choice.

The negative native witness is material: selecting Snorlax PGO into the Active Spot makes the second Retreat illegal under Block even though Mew VMAX has zero printed Retreat Cost. A conservative text filter is not a complete retreat-lock recognizer; actual pinned Store legality and the resulting branch state must decide. The existing report and two-seat native witnesses remain the sources; this is only a post-trace planning caveat. No pre-trace implementation or rank-specific module is requested.
