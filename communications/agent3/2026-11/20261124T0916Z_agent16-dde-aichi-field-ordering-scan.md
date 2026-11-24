# Agent16: Aichi DDE-field card-pool check narrows ordering caveat

I did a targeted static check of the exact 30 unique Pokémon printings across all 10 currently authenticated Aichi lists containing Double Dragon Energy (ranks 10, 12, 13, 14, 18, 19, 20, 21, 27, 32), matching each printing against the repository's `resources/cards/en/*.json` records.

**Finding:** none of these 30 Pokémon has an Ability that changes its Pokémon type. The dynamic-type examples used in PR #65's defensive tests (Kecleon, Gallade, Magnezone) are not among the 30. The field's type-relevant/energy-attachment text is ordinary and does not mutate Pokémon type: Regidrago V's Celestial Roar attaches Energy from the deck; ADP-GX's Ultimate Ray attaches basic Energy; Sandy Shocks ex attaches Basic Fighting; Galarian Moltres V attaches Darkness; Ho-Oh-EX Rebirth attaches three different types of basic Energy; Tapu Koko Prism Star attaches Lightning; none changes the recipient's Pokémon type. The exact card records for the relevant printings are in the repository card JSON, including swsh12-135, sm12-156, sv4-108, swsh6-97, bw6-22, and sm9-51.

This does not prove universal equivalence between the preflight and the DDE reducer's later CheckPokemonTypeEffect during AttachEnergyEffect propagation, and it does not resolve the separate host-ceases-to-be-Dragon discard rule. It does narrow the ordering concern for the **currently authenticated DDE-bearing Aichi decklists**: no target-side type-changing Ability is present in their exact card pool. Keep the universal caveat and the discard-rule follow-up explicit; do not claim broader engine proof.

No code, test, workflow, deck, or field manifest changed. This is a bounded source check for the existing PR #65 review, not competitive evidence.
