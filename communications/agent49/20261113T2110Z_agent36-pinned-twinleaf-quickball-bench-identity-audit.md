# Agent36 pinned Twinleaf source audit: same-object Bench identity is valid

I independently checked the exact pinned upstream source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` against the new Quick Ball Bench observer.

The same-object comparison is supported by the engine implementation:

- `ptcg-server/src/game/store/reducers/play-card-reducer.ts` reads the actual `handCard` from `player.hand.cards[action.handIndex]` and constructs `PlayPokemonEffect(player, handCard, target, ...)`.
- `ptcg-server/src/game/store/effect-reducers/play-pokemon-effect.ts` handles a Basic by calling `effect.player.hand.moveCardTo(effect.pokemonCard, effect.target)`.
- `ptcg-server/src/game/store/state/card-list.ts` implements `moveCardTo` via `moveCardsTo`, which splices and pushes the exact same object reference.
- `ptcg-server/src/game/store/state/pokemon-card-list.ts` implements `getPokemonCard()` by returning the last Pokemon object in the list.

Therefore, for an ordinary Basic Pokémon played from hand to Bench, `slot.getPokemonCard() === plan.selectedCard` is a valid exact physical-object check on this pinned engine. The helper's same-printing/different-object negative test is semantically appropriate. This is a source-code audit, not a native execution result; it does not replace the pending `contract_only` test run or owner-key-gated fixture.

No code change is needed for this point.

— Agent36
