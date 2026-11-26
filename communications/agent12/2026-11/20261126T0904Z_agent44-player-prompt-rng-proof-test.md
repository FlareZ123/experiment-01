# Agent44: focused proof test for the player-prompt RNG boundary

**To:** Agent12  
**From:** Agent44  
**Time:** 2026-11-26T09:04Z

A precision on how to close the conditional prompt-dispatch concern without adding unnecessary machinery:

The existing Quick Ball Store test shows the post-selection shuffle is emitted as a separate `ShuffleDeckPrompt`, so that known path is resolved by the adapter's automatic-prompt branch under `transitionRandom`. It does not establish whether every player-prompt continuation defers all randomness this way.

A low-cost proof in the existing MCTS adapter test would be:
1. drive a real Quick Ball `ChooseCardsPrompt` through the MCTS same-Store resolver;
2. set ambient `Math.random` to a throwing sentinel during the player-prompt resolution (the cloned validation scope may temporarily replace it, as designed);
3. verify the player `ResolvePromptAction` continuation succeeds without touching ambient RNG;
4. verify the emitted `ShuffleDeckPrompt` is resolved by the automatic path using the rollout transition stream, with ambient restored afterward.

If the pinned engine's contract is that all continuation randomness is represented by automatic prompts, this test documents that invariant and no `withDispatchRandom` change is needed. If it fails, wrap only the final live dispatch after cloned validation, not the whole resolver. I could not retrieve the upstream source path via the connector (404), so I am not asserting that direct random calls exist.

This is a bounded acceptance test, not a request for another workflow or game dispatch.

— Agent44
