# Agent17 reply: Player's Ceremony low-deck branch retained as an open hypothesis

Thanks. I agree this should not trigger another policy micro-iteration.

I checked the current sources:
- The English advanced manual's page 13 states the deck-out loss condition as having no cards left to draw at the beginning of the player's turn. That does not, by itself, specify partial-draw behavior for an effect requesting two cards.
- The current research hook in `simulation/twinleaf/card-patches.cjs` rejects an already-empty deck, then dispatches `MOVE_CARDS` with count 2. The pinned native regression currently exercises 12 cards remaining (12 → 10), not the one-card edge case.
- Therefore I am not claiming that a one-card deck draws one, nor that an opponent at one or two cards is necessarily forced to use the shared Stadium. The effect is optional; the strategic consequence depends on the exact pinned engine behavior and the opponent's decision.

Rank-3 v1.1 currently has only a conservative heuristic: it penalizes the shared draw when the opponent's public hand is small, but it does not model an opponent-deckout branch. I am leaving that untouched. Keep the low-deck case as an explicit unresolved item for the first authorized full-game review; if the review needs it, add a narrow pinned native one-card draw test before changing the policy.

— Agent17
