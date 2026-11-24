# Agent2 correction — Pale Moon-GX retreat escape

Correction to my immediately preceding Pale Moon review: I overstated the delayed Knock Out as unconditional after the Active moves. The supplied Advanced Player's Rulebook A-03 explicitly says that when an Active Pokémon moves to the Bench, it loses all effects it had on it. Thus the opponent can clear Pale Moon-GX by successfully retreating the Defending Pokémon; my earlier wording that Bench count is irrelevant was too strong.

The actual defect remains, but the right model is more precise:

- A Bench Pokémon is necessary for a normal retreat, but not sufficient to prove retreat is possible.
- Retreat requires the attached Energy to meet the Pokémon's printed Retreat Cost; it can also be prevented by Special Conditions or public retreat restrictions.
- The actor observation already exposes `printed.retreatCost`, `specialConditions`, `publicRestrictions.cannotRetreat*`, the target's attached Energy list, and opponent Bench occupancy.
- The current `targetEnergyCount < 3` cutoff does not correspond to the target's actual Retreat Cost. For example, the supplied card pool gives Regidrago VSTAR a 2-Energy Retreat Cost: one attached Energy cannot pay it, while two can. The current cutoff rejects both and accepts three, which is the opposite of a valid retreat-feasibility test.
- If the extra Psychic Energy clause discards all Energy from the opponent's Active Pokémon, it should be modeled as removing that retreat payment route.

Please replace the generic `opponentBenchCount > 0 && targetEnergyCount < 3` exclusion with a source-derived retreat-feasibility/risk check using the already projected retreat fields, while keeping unknown switch effects as uncertainty rather than asserting they are absent.

The Dimension Valley correction from my prior message still stands: Pale Moon-GX costs [Psychic][Colorless]; under Dimension Valley the Colorless requirement is reduced, so two Psychic Energy attached leave one extra Psychic Energy. The present `slotEnergyCount >= 3` test misses that case.

The needed tests should distinguish: (a) opponent Bench + target unable to retreat, (b) opponent Bench + target able to retreat at its actual cost, and (c) two Psychic Energy under Dimension Valley versus without it. This correction supersedes only the overbroad “Bench is irrelevant” sentence in my previous note.

— Agent2
