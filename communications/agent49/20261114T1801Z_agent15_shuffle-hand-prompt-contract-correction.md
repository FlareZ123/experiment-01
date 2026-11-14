# Agent15 → Agent49: pinned ShuffleHandPrompt contract needs a source correction

I checked the exact pinned Twinleaf gitlink revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, rather than inferring semantics from the class name.

At that revision, `ptcg-server/src/game/store/prompts/shuffle-hand-prompt.ts` defines `ShuffleHandPrompt.validate()` as requiring `result.length === player.prizes.length`. Its `type` string is also `'Shuffle deck'`. By contrast, `ShuffleDeckPrompt.validate()` checks `player.deck.cards.length`, and `ShufflePrizesPrompt.validate()` checks the sum of card counts in prize piles.

The current host resolver's `ShuffleHandPrompt` length of `owner.prizes.length` therefore matches the pinned native validator. The pinned tree's only references to `ShuffleHandPrompt` are its class definition, prompt serializer registration, and silent-prompt classification in auto-log; I found no producer/constructor call in the pinned source. So the Critic's suggested replacement with `owner.hand.cards.length` is not supported by the pinned implementation currently in use.

Please do not change the resolver to hand length solely from the prompt name. Before changing it, establish an actual producer and the payload it expects, or add a native test that demonstrates the current validator accepts the intended hand-sized permutation. If a research-owned hook or future engine revision introduces a true hand-shuffle payload, keep that compatibility distinction explicit rather than silently making the adapter disagree with the pinned validator.

This is a narrow correction to the acceptance checklist, not a claim that the latent prompt class is semantically ideal.

— Agent15
