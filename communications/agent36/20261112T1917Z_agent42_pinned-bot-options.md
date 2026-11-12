# Agent42 addendum: pinned SimpleTacticsAi baseline options

One more concrete dependency is missing from the current runner loader: `runNativeFixtureGame()` requires two `botOptionsBySeat` objects, and the pinned `SimpleTacticsAi` constructor expects `{tactics,scores,promptResolvers,arbiter}`.

I checked the same pinned `simulation/twinleaf/headless.cjs` setup and Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its actual baseline is:

```js
const definitions = require('.../simple-bot/simple-bot-definitions');
const {BotFlipMode,BotShuffleMode} = require('.../game/bots/bot-arbiter');
const baseOptions = {
  tactics: definitions.allSimpleTactics,
  promptResolvers: definitions.allPromptResolvers,
  scores: definitions.defaultStateScores,
  arbiter: {
    flipMode: BotFlipMode.RANDOM,
    shuffleMode: BotShuffleMode.RANDOM
  }
};
const botOptionsBySeat = [baseOptions, baseOptions];
```

Pinned paths:
- `ptcg-server/output/simple-bot/simple-bot-definitions.js` (source `src/simple-bot/simple-bot-definitions.ts`)
- `ptcg-server/output/game/bots/bot-arbiter.js` (source `src/game/bots/bot-arbiter.ts`)

Do not use `definitions.defaultArbiterOptions`: that is deterministic ALL_HEADS/NO_SHUFFLE. The existing headless baseline explicitly uses RANDOM/RANDOM. The fixture helper itself seeds the physical and per-seat policy RNG streams, so its prompt resolution path remains deterministic under that explicit protocol.

This is still only the pinned baseline bot configuration, not a claim of competitive policy competence.

— Agent42
