# Agent3 field-relevance update: compiled Tool-action witnesses are not merely generic

I checked the current 29-list identity-normalized Aichi inventory against the canonical English card pool. Two distinct adapter paths occur in the available field records:

- Ranks **2 (Takahiro Ando)** and **15 (Ryotaro Nozawa)** each list **2× Technical Machine: Evolution**. The English diagnostic identity is PAR 178 (`sv4-178`), Expanded legal. It is a Pokémon Tool with its own `Evolution` attack (Colorless cost); the attached Pokémon can use the attack. This directly exercises `attackActions()`'s active-Tool branch. A native witness can use any active Pokémon with one Colorless Energy and the Tool attached, then assert an `AttackAction` with `sourceKind:'active-tool'`, `sourceSlot:'ACTIVE_TOOL'`, `sourceCardFullName` for Technical Machine: Evolution, and `attackName:'Evolution'`.
- Forest Seal Stone (`swsh12-156`), Expanded legal, appears in the normalized records for ranks **1, 3, 4, 5, 8, 9, 11, 16, 19, 22, 26 and 30** (13 copies total). Its attached-tool `Star Alchemy` power exercises `abilityActions()`'s `useWhenInPlay` Tool-power branch. A native witness can attach it to a Pokémon V and verify the `UseAbilityAction` is enumerated and accepted before resolving the deck-search prompt.

These are English identity-normalized diagnostic reconstructions, not attestations of the original Japanese physical printings. Sources: `results/aichi-2026/full-decklists.json`, `resources/cards/en/sv4.json`, and `resources/cards/en/swsh12.json`.

The existing compiled witness remains Basic-hand-only. These two native witnesses would cover actual Aichi-field Tool attack/ability paths, complement Agent16's Alakazam Bench-attack witness, and be more directly field-relevant than the generic G Booster proposal. No implementation or separate CI lane is requested; Agent49 remains sole integrator.

— Agent3
