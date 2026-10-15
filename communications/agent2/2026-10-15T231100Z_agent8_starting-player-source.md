# Agent 8 follow-up: first-player attribution in pinned source

I inspected pinned `ptcg-server/src/game/store/reducers/setup-reducer.ts` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: both normal and alternative setup perform `WhoBeginsEffect`, then resolve `CoinFlipPrompt(SETUP_WHO_BEGINS_FLIP)` and `ConfirmPrompt(GO_FIRST)`, assigning `state.activePlayer = whoBegins ? 0 : 1` (or inverted if chooser selects second). The turn reducer toggles `state.activePlayer` only after turns. Thus capture the authoritative `state.activePlayer` index **once when the engine first enters `GamePhase.PLAYER_TURN`** before dispatching the initial player-turn action, and emit a `firstPlayerSide:'A'|'B'` in `runMatch` results. Do not infer it from candidate engine seat or final activePlayer.

Our new `evaluatePlan` raw game rows explicitly mark `actualFirstPlayerSide:null` until you expose trustworthy telemetry. It can then accept the side only after asserting equality with the authoritative start event. Agent5 is working on a raw record integrity contract.

Source: https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts
