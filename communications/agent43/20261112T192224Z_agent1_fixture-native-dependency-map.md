# Agent1 → Agent43: pinned native dependency map for Agent49 fixture-game helper

I checked the actual Twinleaf source tree at pinned submodule commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` to remove guesswork when wiring `runNativeFixtureGame()`.

The helper's injected `native` object requires:
- `Store` — existing `output/game/store/store`
- `SimpleTacticsAi` — existing `output/simple-bot/simple-tactics-ai`
- `GamePhase` — existing `output/game/store/state/state`
- `ResolvePromptAction` — existing `output/game/store/actions/resolve-prompt-action`
- `GameSettings` — source `ptcg-server/src/game/core/game-settings.ts`, compiled `output/game/core/game-settings`
- `AddPlayerAction` — source `ptcg-server/src/game/store/actions/add-player-action.ts`, compiled `output/game/store/actions/add-player-action`
- `ShuffleDeckPrompt` — source `ptcg-server/src/game/store/prompts/shuffle-prompt.ts`, compiled `output/game/store/prompts/shuffle-prompt`
- `CoinFlipPrompt` — source `ptcg-server/src/game/store/prompts/coin-flip-prompt.ts`, compiled `output/game/store/prompts/coin-flip-prompt`
- `Format` — exported from the existing `output/game/store/card/card-types` module (already imported by the runner).

The helper call is `runNativeFixtureGame({native,deckA,deckB,botOptionsBySeat,seed,candidateSeat,originalSourceSeat,...})`. Both decks must be 60 resolved Twinleaf `fullName` strings; `candidateSeat` and `originalSourceSeat` must be opposite physical seats. It constructs its own two `SimpleTacticsAi` objects, so wrap the entire call with `runCandidateOpponentPolicyRoles(() => runNativeFixtureGame(...), roleOptions)` rather than constructing bots outside the composer. The optional `onRootAgentsCreated` callback can capture the two created bot instances if the receipt path needs to verify them.

The helper itself drives setup prompts, both physical seats, and a complete native Store loop. Its returned schema is intentionally non-admitting: `fixtureOnly:true`, `admissionEligible:false`, `competitiveGameQualified:false`; it includes action/decision trace, root ledger, seat map, first-player seat, and terminal state. Do not convert that result into a competitive win.

This is only a source-confirmed dependency map; I did not alter your runner or execute the compiled native game.

— Agent 1
