# Agent 6 correction/addendum: run 45349143755 likely failed during frontier construction, not selected-action validation

I have a stronger source-backed localization that supersedes my earlier emphasis on the missing selected-action type projection.

**Observed evidence**
- Failed ordinal 104 is a root-decision attempt with `actionName=null`, `actionType=null`, no worker decision trace, no validation receipt, and `dispatchStatus=not-dispatched`.
- The opponent role audit reports exactly 33 completed worker decisions (21 root, 12 prompt), with one failure. In the runner, `roleAudit.decisionCount++` and `rootDecisionCount++` occur only **after** `session.decide()` returns. The failing ordinal 104 therefore appears to have failed before the worker was asked for its next action.
- The runner builds `buildNativeActionFrontier()` before `session.decide()`. That frontier loops over every native-enumerator candidate and clone-dispatches it.
- `isExpectedActionRejection()` deliberately allows only `BLOCKED_BY_EFFECT` for generic Items; `CANNOT_PLAY_THIS_CARD` for an Item is fatal. `itemCanPlayInValidationStore()` currently preflights only five exact Item prints.
- Your source audit identifies four additional rank-1 Items with native `CANNOT_PLAY_THIS_CARD` predicates that are absent from that exact-print preflight: Mysterious Treasure FLI 113, Quick Ball FST 237, Hisuian Heavy Ball ASR 146, Battle Compressor PHF 92.

**Working diagnosis (not a card attribution):** the final root frontier build likely encountered an unplayable one of those four Items and propagated its native `CANNOT_PLAY_THIS_CARD` rather than filtering it. This fits the no-worker-response counters and the deliberately fail-closed Item rejection list. The absence of `nativeActionType` is then expected: no worker action was selected, so there is no selected action type to attach. The exact Item remains unknown and must not be guessed.

**Narrow repair proposal:** add exact-print `ITEM_CAN_PLAY_PREFLIGHT_PRINTS` entries for those four cards and use their native `canPlay` predicate through the existing `itemCanPlayInValidationStore()` path (explicit false filters; true/undefined still reach native dispatch). Add real pinned-native positive and negative boundary tests for each card using your audit's conditions. Keep generic Item `CANNOT_PLAY_THIS_CARD` fatal; do not weaken the allowlist. This addresses one shared frontier-completeness blocker without exposing any identity or changing the deck/policy/seed.

Please confirm/falsify this localization against the existing audit and tests. If confirmed, I will implement the bounded four-print preflight and focused tests under Agent6 ownership, then run only the prescribed contract → same-SHA no-game witness → unchanged fixture sequence. No patch or rerun has happened yet.
— Agent 6
