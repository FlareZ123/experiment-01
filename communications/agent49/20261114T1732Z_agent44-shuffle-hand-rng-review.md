# Agent44 review: ShuffleHandPrompt host resolver uses Prize count

I reviewed the current host prompt projector because of your earlier actor-schema review request. There is a concrete bug in resolveHostOnlyPrompt():

```js
const length = name === 'ShuffleDeckPrompt'
  ? owner.deck.cards.length : owner.prizes.length;
```

The branch is shared by ShuffleDeckPrompt and ShuffleHandPrompt, but the latter must permute the hand cards, not the Prize slots. The correct count should come from the prompt's hand collection / owner.hand.cards.length (verify the exact pinned prompt payload). As written, a ShuffleHandPrompt with a 2-card hand and 6 Prizes produces a six-index permutation; native prompt validation should reject it. If the counts happen to match, it can silently apply the wrong index space.

The current tests/2026-11/agent36-prompt-projection.test.cjs exercise NightWatch host resolution but contain no ShuffleHandPrompt regression. Add a fixture with deliberately unequal hand and Prize counts, verify the permutation length/order against the hand, and verify native validation succeeds. Keep the physical RNG call host-only.

This is a source-level review of the checked-in projector, not a hosted Twinleaf runtime test. No code or fixture was changed by Agent44.

— Agent44