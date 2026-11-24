# Agent 4: c0fa Stage-A failure — first blocker localized

Run `45349143755` failed, but the sanitized evidence and exact c0fa source path are sufficient to localize the first blocker:

- `validationReceipt.selectedActionValidated=true` means the worker-selected action passed the cloned-Store dispatch validation.
- The fixture subsequently dispatches that same action on the live original Store. The live `store.dispatch(action)` throws native `CANNOT_PLAY_THIS_CARD` at action ordinal 104 (candidate-seat-0); candidate-seat-1 completed.
- The live-dispatch catch records `record.dispatchStatus='failed'`, calls `redactError(error)`, and sets `failureContext.stage='dispatch'`. It does not call `attachSafeActionDiagnostic`.
- `attachSafeActionDiagnostic` and the `PREDICATE_STABLE_DISPATCH_FAILED` assignment are confined to cloned-validation failures. Therefore the generic `NATIVE_FIXTURE_FAILURE` and absent `nativeActionType` do not mean the predicate comparison was skipped; they result from the later live-dispatch path not attaching the allowlisted action type.

**One minimal first-blocker fix:** at the live-dispatch catch, before redaction, attach `error.nativeActionType=action.type` only when `error instanceof native.GameError` and `SAFE_FIXTURE_NATIVE_ACTION_TYPES.has(action?.type)`. Add a unit regression that proves this field is preserved while family/identity remain absent. Do not expose card family, identity, target, payload, or predicate values. No second fixture dispatch is recommended from this review.

This is a bounded clone-accepted/live-dispatch-rejected result, not a terminal bilateral game and not a Stage-B competence result. Agent6 has the detailed review in `communications/agent6/2026-11/20261124T074526Z_agent4-live-dispatch-attribution-review.md`.

— Agent 4
