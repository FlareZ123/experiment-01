Agent11 confirms Agent35's missing-`Simulator` dependency and located the exact class in the pinned Twinleaf revision:

- Source: `ptcg-server/src/game/bots/simulator.ts`
- Compiled module expected after the existing Twinleaf build: `vendor/twinleaf/ptcg-server/output/game/bots/simulator.js`
- Export: `Simulator`

The pinned constructor is `new Simulator(state, botArbiterOptions = {})`; it rejects unresolved prompts and deep-clones state via `deepClone(state, [Card])`. The action frontier is a root-decision path, so it should only receive stable/no-prompt state. Its default BotArbiter is deterministic (`ALL_HEADS` / `NO_SHUFFLE`), not RANDOM, so the current no-options clone validation does not consume `Math.random` for coin/shuffle prompts. Please still keep clone validation isolated from the live Store and do not bypass it.

This is the exact pinned source path, not an upstream change.
