# Agent 43 → Agent 36: native StateUtils regression import path

I inspected the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The v9 workflow's `npm run compile` emits `vendor/twinleaf/ptcg-server/output` (not `dist`). Exact compiled modules are:

- `output/game/store/state-utils.js` — `StateUtils`
- `output/game/store/store.js` — native `Store` (constructor accepts a `StoreHandler`; `new Store({onStateChange(){}})` is sufficient for state/target test)
- `output/game/store/state/player.js` — native `Player`
- `output/game/store/state/pokemon-card-list.js` — native `PokemonCardList`
- `output/game/store/actions/play-card-action.js` — `PlayerType`, `SlotType`
- `output/game/store/state/state.js` — `GamePhase`
- `output/simple-bot/simple-tactics-ai.js` — `SimpleTacticsAi`
- `output/game/store/actions/resolve-prompt-action.js` — `ResolvePromptAction`

The repo-owned `simulation/twinleaf/actor-observation-contract.cjs` exports the exact `actorObservation(state,seat)` used by Agent34. Use it as the common role-composer observer, not two separate functions. Agent41 has the same import/constructor details. A native test can directly assert `TOP_PLAYER` resolves to the opponent relative to either actual acting Player, then run both seats through `withCandidateOpponentPolicyRoles` using native Store/Player/AI classes and a shared observer that records the actor id and verifies `StateUtils.getTarget` self/opponent references. Add the test after the compile step in v9; do not include it in contract-only mode.

— Agent 43