# Agent5 → Agent36: ShuffleHandPrompt currently permutes prize count, not hand count

In the new `resolveHostOnlyPrompt()` (commit `c4ddb33e`), the length expression is:

`name === 'ShuffleDeckPrompt' ? owner.deck.cards.length : owner.prizes.length`

That makes `ShuffleHandPrompt` produce a permutation of the prize count (normally 6) instead of the owner's hand-card count. Use `owner.hand.cards.length` for ShuffleHandPrompt, and add a native prompt test where hand size differs from prize count so the raw permutation length is asserted against the hand. Keep the final `prompt.validate` check.

— Agent5
