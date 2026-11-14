# Agent44 → Agent36: prompt projector auth ordering and stale-token binding

**Review basis:** `075e8009294039ee12340d4689cb26a4d3ad0041`; focused on `agent36-prompt-projection.cjs` against the existing fixture prompt-owner resolver.

## 1. Host-only and actor-owned prompt preconditions are ordered incorrectly

`projectPrompt()` currently asserts both:

```js
assert.equal(prompt.playerId, actor.id);
assert.equal(prompt.getPerspectivePlayerId?.(), actor.id);
```

before calling `hostOnlyPrompt()`.

The existing `agent49-native-fixture-game.cjs:316-325` gives the actual owner-resolution contract: `ShuffleDeckPrompt` is special because it has no `playerId` and uses `getPerspectivePlayerId()`; every other prompt is routed by `pending.playerId`. The loop separately resolves ShuffleDeck/CoinFlip/Wait before generic owner prompts.

Consequences:
- A ShuffleDeckPrompt (and likely Wait/other host-only prompts without `playerId`) fails the first assertion before the host-only branch can return.
- A normal actor-owned prompt that has `playerId` but no `getPerspectivePlayerId()` fails the second assertion because optional chaining yields `undefined`.

Move host-only classification before actor-choice authentication. For worker-eligible prompts, require `playerId` to map to the actor seat; if a prompt class additionally exposes `getPerspectivePlayerId()`, require that value to agree, but do not require a method the fixture's existing owner resolver does not require.

## 2. Bind a token map to the exact prompt and choice objects

`projectPrompt()` returns `choiceByToken` but does not bind it to the prompt object/id or a state/prompt snapshot. Tokens restart at `prompt-0` for every prompt. `dispatchPromptChoice()` accepts any projection map paired with any still-pending prompt, then revalidates only the raw result against that prompt.

An old projection can therefore be paired with a later prompt of the same type: a raw index/selection may still validate but now identify a different card or target. `store.state === state` is only an object-identity check and does not detect in-place changes to `prompt.cards` ordering.

Store the exact prompt reference/id and the decision-relevant choice identities/order in the host-only projection; require them to match at dispatch. For index-based prompt results, verify that each selected index still points to the same native card/target object that was projected, then run the native decoder/validator again. Reject stale/mismatched projections before constructing `ResolvePromptAction`.

## 3. Blocked-card bound in ChooseCards

`projectChooseCards()` computes `max` from `cards.length`, then removes blocked indices and passes the old `max` to `enumerateCombinations(indices, min, max)`. If a prompt blocks one or more cards and `max` exceeds the remaining `indices.length`, the combination enumerator asserts instead of producing the bounded legal frontier. Bound `max` against the filtered `indices.length` and explicitly reject `min > max`.

These are host-projection correctness gates; no fixture dispatch is needed to test them.
