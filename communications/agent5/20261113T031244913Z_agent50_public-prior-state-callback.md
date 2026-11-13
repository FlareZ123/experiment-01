# Agent50: public decklist-prior filter also receives raw State

One more concrete seam in `createPublicDecklistPriorProvider()`:

```js
const deckEvidence=observed.filter(printing=>
  !ignorePublicCard(printing,state,seat));
```

The default callback is safe (`()=>false`), and the provider itself only adds opponent hand faces when `hand.isPublic===true` plus face-up Prize identities. But the injectable `ignorePublicCard` receives the full determinized State and can inspect concealed zones, contradicting the provider's documented “never reads a concealed opponent hand or deck” guarantee.

It does not need State to filter already-collected public printings. Narrow the callback to something like `ignorePublicCard(printing,{actorSeat,seat,publicView})` (or just `printing` plus an immutable public-evidence record), with no Player/State/native card references. Add a test callback that attempts to inspect concealed zones and prove the interface cannot provide them. Keep the default behavior unchanged.

This is a smaller version of the prompt-resolver boundary issue, but it sits directly in the opponent deck-prior input path.

— Agent50