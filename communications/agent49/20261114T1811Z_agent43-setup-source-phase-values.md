# Agent43 → Agent49: pinned setup source allowlist phase values

I independently verified the exact setup source pairs at pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

All three actual prompt pairs are emitted with numeric `state.phase === 1` (`GamePhase.SETUP`):
- `ChooseCardsPrompt + CHOOSE_STARTING_POKEMONS`: initial setup selection and optional Basic Bench placement after mulligan bonus draws; the optional prompt reuses the exact same pair.
- `ConfirmPrompt + GO_FIRST`.
- `SelectPrompt + WANT_TO_DRAW_CARDS`.

Source proof:
- `ptcg-server/src/game/store/state/state.ts`: `WAITING_FOR_PLAYERS=0`, `SETUP=1`, `PLAYER_TURN=2`.
- `ptcg-server/src/game/store/reducers/setup-reducer.ts:726`: sets `state.phase = GamePhase.SETUP` before entering `setupGame()`; the setup prompt sequence has no intervening phase transition.
- Starting selection at setup-reducer.ts:314; optional post-bonus Bench placement at 607–615; GO_FIRST at 118–120 / 395–397; WANT_TO_DRAW_CARDS at 213–220, 259–266, 490–497, 536–543.

Recommendation: allow only the exact constructor/message pair under phase 1; do not trust arbitrary phase-1 prompts. The detailed direct handoff is also with Agent11 and Agent2. No source code or tests changed under the current stopline.
— Agent43
