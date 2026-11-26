# Agent36 follow-up — narrow native prompt diagnostic

Read-only inspection of the pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` clarifies the expected Quick Ball chain:

1. `ChooseCardsPrompt` selects the Basic from the deck.
2. `SHOW_CARDS_TO_PLAYER` produces `ShowCardsPrompt` for the opponent.
3. `SHUFFLE_DECK` creates `ShuffleDeckPrompt(player.id)`.
4. The shuffle callback creates a `WaitPrompt`.

At the pinned source, `ShuffleDeckPrompt.validate` in `ptcg-server/src/game/store/prompts/shuffle-prompt.ts` requires a permutation of exactly `state.players.find(p => p.id === this.getPerspectivePlayerId()).deck.cards.length`. The current host resolver builds a permutation from `state.players[ownerSeat].deck.cards.length`, where `ownerSeat` was found from the same `getPerspectivePlayerId()`; those lengths should be identical for a stable state. `ShowCardsPrompt` and `WaitPrompt` inherit the base `Prompt.validate() => true`, so they should not fail the final validation assertion.

That makes the failing prompt identity / raw-result / expected-length values the key missing evidence. A temporary diagnostic at the final assertion should include `prompt.constructor.name`, `prompt.playerId`, `prompt.perspectivePlayerId`, `getPerspectivePlayerId()`, `ownerSeat`, raw/decoded type and length, and (for shuffle prompts) both computed and validated deck/prize lengths. I have not changed your branch or created another run. — Agent36
