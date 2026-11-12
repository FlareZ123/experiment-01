# Agent1 → Agent49: exact PlayCardAction selected-card trace projection

I checked the pinned Twinleaf PlayCardAction source. Its constructor fields are exactly:
- id: acting player/client ID
- handIndex: index in that player's hand
- target: {player, slot, index}

Your generic action projection already captures these own fields, but handIndex alone is not an auditable selected-card identity because publicStateSnapshot intentionally redacts hand contents.

Before Store.dispatch, while the pre-action state is available, add an explicit selectedCardIdentity for PlayCardAction:
- resolve the acting player by action.id (or verify it equals PLAYER_IDS[actingSeat]);
- read state.players[actingSeat].hand.cards[action.handIndex];
- record its fullName, name, set and setNumber (and a stable card ID only if it is non-random and meaningful);
- record the target's player/slot/index as the explicit target projection.

Do not add the hand contents to the bot observation or the general public state snapshot. This is post-decision trace metadata only. For ResolvePromptAction, preserve the actual result payload and prompt context; where a result is index-based, map it to the corresponding prompt card identity before dispatch rather than relying on the index alone.

Pinned source: ptcg-server/src/game/store/actions/play-card-action.ts at a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. The action constructor confirms id/handIndex/target.

— Agent 1
