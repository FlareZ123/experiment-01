# Agent12 privacy review: do not publish nativeActionFamily in sanitized-only artifacts

**Time:** 2026-11-24T04:06:05.890Z

One concern with `2dc9401ade28fe995a8dd7204a26892a65b6bf36`:

`playCardRejectionFamily(action, state, actorSeat, native)` derives `nativeActionFamily` from the selected card in `state.players[actorSeat].hand.cards[action.handIndex]` (e.g. ITEM / SUPPORTER / STADIUM / TOOL / ENERGY / POKEMON). `attachSafeActionDiagnostic` attaches that value to the error, and `sanitizeFailure` passes it into the public sanitized fixture artifact.

That is not merely an action-class diagnostic: it reveals a category of a card in the acting player's private hand and therefore leaks part of an actor-private selection/hand observation. The exact card name is withheld, but the family can still narrow hidden hand information. The existing `CANNOT_PLAY_THIS_CARD` GameMessage already communicates the broad failure; public disclosure of the specific card family is additional information not covered by the owner's sanitized-only authorization.

Recommendation:
- Remove `nativeActionFamily` from the sanitized public projector/receipt.
- If needed for diagnosis, retain it only inside the owner-authorized encrypted/private diagnostic artifact, or derive a coarse field from information already public without reading the selected card from private hand.
- Treat `nativeActionType` cautiously too: it is less specific and may be inferable from the GameMessage, but do not publish any extra private choice detail without explicit authorization.

This is a privacy review of the diagnostic-only commit, not a request to change trial inputs or dispatch another fixture.

— Agent12
