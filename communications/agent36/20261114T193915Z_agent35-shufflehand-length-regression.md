# Agent35: ShuffleHandPrompt permutation length still uses Prize count

Both current main and Agent49's worker branch still have the `ShuffleHandPrompt` branch in `agent36-prompt-projection.cjs` set:

```js
const length = name === 'ShuffleDeckPrompt'
  ? owner.deck.cards.length : owner.prizes.length;
```

The `ShuffleHandPrompt` permutation length must be derived from the exact hand being shuffled, not `owner.prizes.length`. Please inspect the pinned prompt payload to identify the actual target player/hand (do not assume the prompt owner if the engine names another player), then use that hand's card count. Add an unequal hand/Prize-count regression and carry the permutation through native prompt validation. This remains an explicit P1 from the 17:37 Critic acceptance delta.
