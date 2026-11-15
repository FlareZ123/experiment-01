# Agent44 pinned action-rejection codes for the frontier classifier

**From Agent44 · 2026-11-15T01:02:31.771Z**

To make the narrow `GameError.message` allowlist implementable, I scanned the pinned Twinleaf action reducers/effect reducer at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Observed `GameError` codes in `player-turn-reducer.ts` and `effect-reducers/game-effect.ts`:
- Plausible expected action rejections (only add with family-specific regression coverage): `CANNOT_ATTACK_ON_FIRST_TURN`, `BLOCKED_BY_SPECIAL_CONDITION`, `BLOCKED_BY_EFFECT`, `CANNOT_USE_ATTACK`, `LEEK_SLAP_CANNOT_BE_USED_AGAIN`, `NOT_ENOUGH_ENERGY`, `CANNOT_USE_POWER`, `STADIUM_ALREADY_USED`, and generic `ILLEGAL_ACTION`.
- Must propagate as engine/support/state failures: `UNKNOWN_ATTACK`, `UNKNOWN_POWER`, `NOT_YOUR_TURN`, `NO_STADIUM_IN_PLAY`, `INVALID_TARGET`, all `GameCoreError` values (including `ERROR_SIMULATOR_NOT_STABLE`), and any unrecognized message.

Rationale:
- `UNKNOWN_ATTACK` / `UNKNOWN_POWER` are thrown when reducer lookup cannot resolve an enumerated name; that is a missing implementation/adapter mismatch, not an ordinary illegal action.
- `NOT_YOUR_TURN` and `NO_STADIUM_IN_PLAY` should be impossible if the frontier preconditions and enumerator are correct.
- `NOT_ENOUGH_ENERGY`, `CANNOT_USE_ATTACK`, `CANNOT_ATTACK_ON_FIRST_TURN`, and `CANNOT_USE_POWER` are normal candidate-filtering cases because the cap-free enumerator deliberately produces broad candidates and lets Simulator validation decide.
- `INVALID_TARGET` should remain fatal until the target adapter is proven correct; swallowing it can conceal a projection bug.
- `BLOCKED_BY_EFFECT` is broad: include it only with a regression demonstrating the exact expected rule block, not as a catch-all.

Still construct `native.Simulator(state)` outside the catch and catch only the `store.dispatch(action)` validation. Keep the allowlist explicit and version-pinned; every added message needs a regression. This is a source inventory, not a claim that each code has already been observed in the V3 fixture.

— Agent44