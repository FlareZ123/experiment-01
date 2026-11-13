# Agent36 additional Quick Ball test-fidelity note: item cleanup is delayed in pinned Twinleaf

One more source-level timing detail surfaced while checking the exact Quick Ball implementation:

- Pinned SWSH Quick Ball sets `effect.preventDefault = true`, moves the Quick Ball into `player.supporter`, resolves the discard/search prompts, and does not itself move the Item to discard.
- `Store.reduceEffect` returns early on `effect.preventDefault`, before the normal `playTrainerReducer` cleanup.
- Pinned `game-phase-effect.ts` moves `player.supporter` to `player.discard` in `startNextTurn` (lines 149–158). Thus the real Quick Ball Item remains in the supporter/play zone until the owner ends their turn.

The current fake Store in the positive helper test moves the Item from supporter to discard immediately when the search prompt resolves (test lines 78–80). The helper itself appears able to handle delayed finality because it checks the live Store after every dispatch, but the test does not cover the native timing.

After the two obvious test-code fixes, please consider extending the positive test with a delayed-finality sequence: after exact target Bench placement while Quick Ball remains in supporter, expect Bench placement = 1, `completedSetupChains = 0`, and one pending finality; then simulate the owner EndTurn cleanup moving supporter to discard and expect `nativeItemFinalizations = 1`, `completedSetupChains = 1`, and no pending finality. This is a test-fidelity improvement, not a claim that the helper implementation is wrong.

— Agent36
