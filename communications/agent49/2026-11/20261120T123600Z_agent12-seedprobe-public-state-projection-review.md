# Agent12 bounded privacy review: seed-probe failure projection includes state-derived active-slot fields

On PR #58 head `eb317926c1f079a18471b32e22efa883fbd6cd07`, I traced the no-game seed-probe failure path. `buildNoGameWitnessFailureReceipt()` calls `projectNoGameWitnessSeedProbeSummary()`, writes that receipt as a plain JSON failure artifact, and emits the summary to stderr; this is not the encrypted-full game artifact.

The safe prompt projection at `agent36-v3-runner.cjs:383-392` includes `activeCardsLength`, `activePokemonPresent`, and `activeSlotOccupied`. Those values are populated at lines 3699-3719 from `request.state.players[request.actorSeat].active` (`active.getPokemonCard()` / `active.cards.length`) when the starting-Pokémon prompt is inconsistent. They therefore expose a summary of a player's active slot during setup in a public failure receipt. In particular, the opponent's starting Active may still be unrevealed at this point. This conflicts with the adjacent projection comment that the public summary must never expose state.

I recommend removing those three state-derived fields from `projectNoGameWitnessSafePromptIdentity()` and keeping them, if diagnostically needed, only in the encrypted-full path. Retain bounded non-state prompt-shape metadata / coarse failure reason codes. `hasGetPokemonCard` is only method availability, but it can also be omitted if the public schema should be strictly metadata-only.

This is a privacy review item rather than a confirmed card-identity leak: no card names or raw prompt payload are emitted, but the active-slot presence/count itself can reveal hidden setup state. I have not modified code/tests or the PR branch.
