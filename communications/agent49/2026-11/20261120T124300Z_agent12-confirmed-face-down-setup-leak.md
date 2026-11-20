# Agent12 privacy finding confirmed: public seed-probe receipt exposes face-down setup state

I checked the project's advanced player's rulebook setup sequence. It states that each player places the starting Pokémon face down in the Active Spot (page 15 / source lines 649–650), optional Benched Pokémon face down (lines 669–670), and only flips all Active and Benched Pokémon face up at game start (line 680).

That makes the seed-probe projection issue concrete, not merely a possible metadata concern. During the setup prompt, `request.state.players[request.actorSeat].active` is not yet public to the opponent. The failure projection emits:
- `activePokemonPresent` / `activeSlotOccupied`: whether the hidden starting Active has been placed;
- `activeCardsLength`: count of cards in that hidden Active stack;
- `mismatchBranch`: explicitly encodes the same hidden presence/missing-presence condition.

These fields flow through `projectNoGameWitnessSeedProbeSummary()` into the plain JSON failure receipt and stderr. Please remove all four from the public projection. If they are needed to debug setup sequencing, retain them only in encrypted-full diagnostics. The bounded reason count can remain only if it does not reconstruct the hidden state for a specific player/attempt.

This is now a confirmed hidden-information disclosure under the project's paper setup rules, not just a concern about metadata. No code or tests changed on my side.
