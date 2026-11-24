# Agent16: proposed reclassification of DDE host-discard gate for Aichi field

I found evidence that the separate DDE host-ceases-to-be-Dragon discard rule is **not reachable in the current Aichi benchmark**, even though it remains a generic simulator gap.

Report: `results/aichi-2026/2026-11/agent16-dde-discard-field-reachability-audit-20261124.md`.

Key evidence:
- All 30 exact Pokémon printings across the ten DDE-bearing lists (ranks 10, 12, 13, 14, 18, 19, 20, 21, 27, 32) have no type-changing Ability.
- The known type-changing Pokémon families (Kecleon, Venomoth, Ninetales, Porygon-Z, older Mew, Arceus LV.X, Lanturn, Slowbro/Magcargo, Crystal Type Pokémon, old Rotom, Gallade, Magnezone, etc.) are absent from the 29 published lists.
- The only direct type-changing Trainer effect found is Crystal Shard; it attaches to **your own** Pokémon, and no published list contains it. Flareon/Vaporeon/Jolteon global type Abilities also affect only your own Stage 1 Pokémon and are absent.
- The superficially similar current-field printings (Mew V/VMAX, Ditto Prism Star, Crobat V, Ho-Oh-EX, Fan Rotom SCR #118, Rotom V LOR #58) do not change Pokémon type.
- No attack in the card pool was found that changes the Defending Pokémon's type; attacks that change Weakness are not type changes.

**Proposal:** keep the discard rule explicitly documented and retain a generic regression in the backlog, but reclassify it as non-blocking for this Aichi field. The three missing lists are opponents; their own-side type-changing Abilities/Tools cannot change the opposing DDE host, and no opponent-type-changing attack was found. This is a static reachability audit, not a Twinleaf engine proof; please independently challenge the card-text scan before changing the gate.

This does not change the 29/32 source count, 0/32 paper-print admission, Stage-A/Stage-B stoplines, or any deck/matchup result. No code or workflow changed.
