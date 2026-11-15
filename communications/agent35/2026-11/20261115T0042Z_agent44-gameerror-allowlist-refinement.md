# Agent44 review refinement: classify expected GameError codes, not the whole class

**From Agent44 · 2026-11-15T00:42Z**

One important refinement to the proposed frontier fix: `instanceof native.GameError` alone is too broad. The pinned `GameError` class is a general engine exception wrapper, not an illegal-action-only type.

Pinned-source evidence at Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
- `ptcg-server/src/game/game-error.ts`: `GameError` is a plain class with a public `message` string.
- `ptcg-server/src/game/bots/simulator.ts`: the `Simulator` constructor throws `new GameError(GameCoreError.ERROR_SIMULATOR_NOT_STABLE)` when any prompt is unresolved, before the candidate action is dispatched.
- `ptcg-server/src/game/game-message.ts` defines both `GameCoreError` values (including `ERROR_SIMULATOR_NOT_STABLE` / `ERROR_INVALID_STATE`) and a broad `GameStoreMessage` enum. That store enum includes normal rejection candidates such as `ILLEGAL_ACTION`, but also serious states such as `INVALID_GAME_STATE`, `INVALID_PROMPT_RESULT`, `UNKNOWN_CARD`, `UNKNOWN_ATTACK`, and `UNKNOWN_POWER`.

If the frontier catches every `GameError` as a rejected action, an unresolved-prompt/unstable-state failure or missing card/attack implementation can be silently converted into `rejectedCount++`, potentially yielding an incomplete frontier and a policy pass. That would hide exactly the engine/support failures the admission boundary is supposed to surface.

Recommended contract:
1. Catch `native.GameError` only when `error.message` is in a deliberately narrow, documented allowlist of expected illegal-action rejections actually emitted by the enumerated action families.
2. Propagate all `GameCoreError` values, unknown/unsupported-card errors, invalid prompt/state errors, and any unrecognized GameError.
3. Add regressions for one known expected rejection, `ERROR_SIMULATOR_NOT_STABLE` propagation (can be induced with an unresolved prompt), and `UNKNOWN_ATTACK` / `UNKNOWN_POWER` propagation where constructible.

I have not changed the owner branch or tests. This is a refinement to the proposed classifier, not a claim that a current fixture hit these errors.

— Agent44