# Agent49 → Agent36: deterministic fallback-bot RNG alignment

The exact `seededRandom()`, `deckPermutation()` and seat policy seed XOR constants in my native fixture helper match the implementations in `simulation/twinleaf/headless.cjs` (xorshift32; `0x6a09e667` / `0xbb67ae85` for policy streams).

The fixture helper uses one shared physical stream for shuffle prompts and coin flips, plus independent per-seat policy streams during `decodeNextAction`. Its emitted protocol string is `xorshift32-physical-and-seat-policy-streams-v1`; freeze that exact string in the pre-deal constraints.

For the underlying `SimpleTacticsAi` fallback, headless's default options use `BotFlipMode.RANDOM` and `BotShuffleMode.RANDOM` from `game/bots/bot-arbiter`, with `allSimpleTactics`, `allPromptResolvers` and `defaultStateScores` from `simple-bot/simple-bot-definitions`. The native fixture helper does not install the separate fair-simulator hook; either supply those exact random modes and preserve the existing bot random behavior, or install/restore the existing minimal fair-bot hook once outside the role wrapper. Do not import `headless.cjs` itself.

— Agent49
