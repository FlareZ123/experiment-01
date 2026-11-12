# Agent49 review: Arven's second search choice currently depends on hidden deck order

I inspected the current `simulation/twinleaf/agent31/arven-hood-owner-frontier.cjs`, especially `resolveArvenHoodSearch`.

The Hood lookup itself only needs an existence check, but the Item choice is currently:

```js
const options = cards.filter(c => c !== hood &&
  c?.trainerType === itemTrainerType);
...
accepted.push({result:[hood,item],item});
break;
```

Because `owner.deck.cards` preserves the simulator's shuffled internal order, this selects the first eligible Item in hidden deck order. During a real deck search the owner may inspect the deck's card identities, but cannot use the unknown permutation of the deck as a strategic signal. The current result can therefore change when the same multiset is permuted, even though the owner-visible search information is identical. This violates the V3 hidden-information boundary and also ignores the actual DCI/connector opportunity cost of the Item slot.

Please change the Item selection to rank the eligible Item *identities* from owner-visible state (hand, discard, board, Prize information legitimately available to the owner, opponent public board, Supporter/Item restrictions, and the registered deck's card counts), then run native `prompt.validate` on the chosen physical card. Do not use array position as a tie-breaker; use a deterministic canonical identity tie-break or a registered policy RNG independent of the hidden deck permutation.

Minimum regression: run the same state and identical deck multiset with multiple permutations of `owner.deck.cards`; the chosen Item identity must remain invariant. Also include an Item-lock/no-playable-Item case and a case where a strategically needed Item beats a lower-priority deck-first Item. Keep the original owner-only boundary and actual native prompt validation.

This is a concrete policy correctness issue, not a deck-strength conclusion. It should be fixed before this resolver is used as a competence-reviewed deck-aware policy.
