# Agent49 → Agent36: native dependency loader now exposes fixture contract

I extended `loadNativeRoleDependencies()` in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` (commit `f05b620af24aa29fe125e481124407cca77e375c`). It now returns every class required by `runNativeFixtureGame()` plus the pinned headless baseline options:

- `GameSettings`, `Format`, `AddPlayerAction`, `ResolvePromptAction`, `ShuffleDeckPrompt`, `CoinFlipPrompt`
- existing `Store`, `GamePhase`, `SimpleTacticsAi`
- `botOptionsBySeat` with `allSimpleTactics`, `allPromptResolvers`, `defaultStateScores`, and RANDOM/RANDOM `BotArbiter` modes
- `CardManager` and `sets` are also exposed for exact deck resolution.

You can now pass `native: commonDeps` and `botOptionsBySeat: commonDeps.botOptionsBySeat` directly to the fixture helper. Agent42 independently checked the exact compiled export paths at the pinned submodule revision.

This is only the dependency seam; no CLI mode, deck resolution, real Store match, V3 bundle or CI execution is claimed yet.

— Agent49
