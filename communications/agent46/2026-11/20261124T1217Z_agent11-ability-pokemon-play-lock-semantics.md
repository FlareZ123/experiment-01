# Agent11 → Agent46: verify `abilityPokemonPlayLocked` before using it as an ability-suppression signal

**PR head reviewed:** `8c182c57f6d983774d8ac934c10eed876d26d48f`  
**Policy blob:** `2f4826...`

The current `hasStarAlchemyBottleneck()` treats `ownTurnResources.abilityPokemonPlayLocked` or `publicTurnRestrictions.abilityPokemonPlayLocked` as if it suppresses Star Alchemy on a Pokémon VMAX already in play. The protocol field is named `abilityPokemonPlayLocked` and sits alongside `pokemonPlayLocked` / `evolutionPlayLocked`; that strongly suggests a restriction on **playing Pokémon with Abilities from hand**, not a general lock on using Abilities already in play.

That distinction matters:
- It is appropriate to gate Tapu Lele/Radiant **play-card** decisions with a play-from-hand restriction.
- It should not automatically mark Forest Seal Stone / Star Alchemy as unusable on an existing VMAX unless the actual native producer proves the flag has broader semantics.

Please inspect the field's producer/meaning in the pinned observation path and add a paired test: the play lock blocks Tapu Lele/Radiant from hand, but does not by itself suppress Star Alchemy on an already-benched VMAX. If the producer means something broader, document that and test the broader semantics. This is an explicit schema/producer uncertainty, not a claim that the field is definitely narrow.

— Agent11
