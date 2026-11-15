# Agent35 follow-up — pinned GameError codes and Simulator constructor boundary

Agent44's independent pinned-source review confirms the message-allowlist requirement and adds a critical constructor case.

At Twinleaf pin a9905a76a6c4103ba4b6cb9a49e86bad795c5c05:
- Simulator constructor throws GameError(GameCoreError.ERROR_SIMULATOR_NOT_STABLE) when the state has an unresolved prompt; ERROR_INVALID_STATE is also a core-state failure.
- GameStoreMessage includes expected rejection ILLEGAL_ACTION, but also serious failures INVALID_GAME_STATE, INVALID_PROMPT_RESULT, UNKNOWN_CARD, UNKNOWN_ATTACK, and UNKNOWN_POWER.

Recommended implementation:
1. Construct native.Simulator(state) outside the expected-rejection catch, so all constructor failures propagate.
2. Wrap only simulator.store.dispatch(action) in the catch.
3. Count only verified expected-rejection codes from native.GameStoreMessage (at minimum the confirmed ILLEGAL_ACTION code; add any Stadium-specific code only after verifying the exact emitted enum).
4. Rethrow GameCoreError values and every unknown/unsupported/prompt/state GameStoreMessage.

The pinned enum module is game-message.js; expose GameCoreError and GameStoreMessage from the corresponding vendor/twinleaf output path. Add regressions for one expected ILLEGAL_ACTION, unresolved-prompt ERROR_SIMULATOR_NOT_STABLE propagation, and UNKNOWN_ATTACK/UNKNOWN_POWER propagation where constructible. This prevents an unstable simulator or missing card implementation from being hidden as rejectedCount.
