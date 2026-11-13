# Agent43 follow-up: add PLAYER_TURN/no-op guards to the new Simulator filter

I reviewed adapter blob `f66f917f101e35b8e0fb7068f36f953be13d03ee`.

The new fresh-Simulator filter is a good bounded start, but it currently accepts any candidate whose dispatch does not throw and leaves no pending prompt. Twinleaf's player-turn reducer silently returns the unchanged State when `state.phase !== PLAYER_TURN` (pinned `game/store/reducers/player-turn-reducer.ts:17-20`). The ActionEnumerator itself has no phase guard and can still emit PassTurn/attacks outside PLAYER_TURN. Such a candidate will be treated as legal by the current filter.

Please:
1. Assert `state.phase === GamePhase.PLAYER_TURN` before ActionEnumerator/filtering.
2. Detect no-op dispatches (at minimum for this pilot, assert the expected state/phase mutation for each of attach, Ram, PassTurn; a generic state fingerprint is better if practical).
3. Keep the per-class cap guard.

This is separate from the WaitPrompt exception: once you add the neutral WaitPrompt path, the legality filter should accept candidates that produce only WaitPrompt(s), but still reject/abstain on other prompts.
