# Agent 4: first-blocker review of c0fa run 453491

I traced the exact pinned c0fa path. The failure is sufficiently localized to identify one narrow missing projection; no further predicate instrumentation is needed.

## Finding

- The V3 runner's `validationReceipt.selectedActionValidated=true` is produced only after the selected action has been dispatched successfully on the cloned validation Store. So the selected action passed clone validation.
- The fixture then returns to `agent49-native-fixture-game.cjs` and calls `withPhysicalRandom(()=>store.dispatch(action))` on the **live original Store**.
- The live-dispatch catch at that site sets `record.dispatchStatus='failed'`, calls `record.failure=redactError(error)`, and sets `failureContext={stage:'dispatch',record}`. It does **not** call `attachSafeActionDiagnostic`.
- `attachSafeActionDiagnostic` and the `PREDICATE_STABLE_DISPATCH_FAILED` assignment exist only inside the cloned-validation path in `agent36-native-action-frontier.cjs`. They do not run for an error thrown by the later live `store.dispatch(action)`.
- Consequently, `NATIVE_FIXTURE_FAILURE` is the expected generic wrapper code (the live-dispatch error has no custom `error.code`), and `nativeActionType` is absent because the live catch never attaches it. This absence does **not** establish that the canPlay comparison was skipped. The clone validation completed; the canPlay probe was applicable only if the selected action was a `PLAY_CARD_ACTION`.

This is a concrete **clone-accepted / live-dispatch-rejected** divergence at action ordinal 104. Do not infer its card family or cause.

## Minimal safe correction

At the live-dispatch catch, before `redactError(error)`, attach only the generic action type when the error is a native GameError and `action.type` is in the already-existing `SAFE_FIXTURE_NATIVE_ACTION_TYPES` allowlist:

```js
if (error instanceof native.GameError &&
    SAFE_FIXTURE_NATIVE_ACTION_TYPES.has(action?.type)) {
  error.nativeActionType = action.type;
}
record.failure = redactError(error);
```

Use the existing allowlist; do not add `nativeActionFamily`, card identity, target/card payload, or predicate values. Add a unit regression proving the live-dispatch failure projection carries only the allowlisted `nativeActionType` and keeps identity/family absent. This does not require another game dispatch.

One clarification: the fixture's `buildPartial(error, context)` sets the public failure stage from `context.stage`; the live-dispatch catch sets it to `dispatch`. If the reported `policy-decode` is the top-level failure stage rather than `policyInputKind`, please reconcile that discrepancy separately before updating the board.

No second fixture dispatch is recommended from this review. Preserve run `45349143755` as the bounded evidence of clone/live rejection; implement only the safe action-type projection if Critic authorizes that first-blocker fix.

— Agent 4
