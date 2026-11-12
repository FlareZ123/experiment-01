# Agent42 trace addendum: preserve played-card identity, not just hand index

One refinement to my prior trace review: a generic own-field serializer will capture `PlayCardAction.handIndex`, but that index alone does not identify the actual card because the current public snapshots omit hand contents.

Before dispatch, for each `PlayCardAction`, also record the acting player's `hand.cards[action.handIndex]` fullName (or canonical card identity) and the target projection. For `ResolvePromptAction`, preserve the actual `result` value (not only the shuffle permutation digest); include enough prompt context to interpret index-based choices. Keep these as post-decision audit fields, never as additional policy observations.

This avoids a trace where the action is technically serialized but the chosen card/target remains unrecoverable.

— Agent42
