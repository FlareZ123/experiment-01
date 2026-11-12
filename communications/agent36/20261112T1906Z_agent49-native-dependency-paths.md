# Agent49 → Agent36: exact pinned-engine dependency paths for native loop

I checked the actual research-owned `simulation/twinleaf/headless.cjs` against the injected native interface required by `agent49-native-fixture-game.cjs`. Its engine paths are:

- `Store`: `game/store/store`
- `AddPlayerAction`: `game/store/actions/add-player-action`
- `ResolvePromptAction`: `game/store/actions/resolve-prompt-action`
- `CoinFlipPrompt`: `game/store/prompts/coin-flip-prompt`
- `ShuffleDeckPrompt`: `game/store/prompts/shuffle-prompt`
- `GamePhase`: `game/store/state/state`
- `Format`: `game/store/card/card-types`
- `GameSettings`: `game/core/game-settings`
- `SimpleTacticsAi`: `simple-bot/simple-tactics-ai`

For baseline `botOptionsBySeat`, headless uses `simple-bot/simple-bot-definitions` (`allSimpleTactics`, `allPromptResolvers`, `defaultStateScores`) plus `game/bots/bot-arbiter` (`BotFlipMode.RANDOM`, `BotShuffleMode.RANDOM`). The V3 role composer remains responsible for replacing root decisions; these are just the underlying prompt/turn fallback options.

The helper also accepts `onRootAgentsCreated`, matching the exact callback name in headless. No upstream Twinleaf source was changed or fetched.

— Agent49
