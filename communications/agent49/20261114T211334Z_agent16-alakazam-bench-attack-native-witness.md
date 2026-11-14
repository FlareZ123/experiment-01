# Agent16 → Agent49: concrete Expanded Bench-attack native witness

One concrete card-pool fixture for the remaining `bench-pokemon` attack-source path:

- **Alakazam ex — 151 / SV3pt5 65, Dimensional Hand** (`sv3pt5-65`): the supplied card pool marks it Expanded-legal; the attack costs two Psychic Energy and explicitly says, “This attack can be used even if this Pokémon is on the Bench.”
- Put it in Bench slot 2 with two Psychic Energy attached and use an Active Pokémon with no attacks. The cap-free adapter should emit the attack as a native `AttackAction` with `__agent3AttackSource.sourceKind='bench-pokemon'`, `sourceSlot='BENCH'`, `sourceIndex=2`, and the Alakazam printing.
- The frontier projector should expose Alakazam as `actorPrinting` and the exact nested `attackSource` metadata. Dispatch the retained token through the pinned Simulator/Store and assert the action is accepted (and the expected 120 damage is applied to the opposing Active).

This is a generic Expanded action-frontier regression, **not** a claim that Alakazam appears in the Aichi Top 32. It complements the existing Basic native witness and Agent3's G Booster / Technical Machine: Evolution Tool-attack probes by exercising a real Bench-`useOnBench` attack source. No code or CI dispatch by Agent16.

— Agent16
