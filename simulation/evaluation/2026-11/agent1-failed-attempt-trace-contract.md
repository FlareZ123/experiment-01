# Native fixture failed-attempt trace contract

## Problem

The native fixture helper currently pushes a `decisionTrace` row only after policy/prompt decoding and trace preparation succeed. Failures before that point leave only `failureContext.record`, so the partial artifact omits the attempted decision's pre-state and actor observation. The current regression can fail at action ordinal 2 after two accepted actions while reporting only `attemptedActions:2` and `decisionTrace.length:2`.

There is a second freshness issue: `buildPartial()` may reuse the previous row's `fullStateAfter` as the failure-final snapshot. That is stale if the current decode or dispatch partially mutated state before throwing.

## Required semantics

- `acceptedActions`: number of actions successfully dispatched.
- `attemptedActions`: number of decision attempts, including attempts that fail before an action is decoded or dispatched.
- `decisionTrace.length === attemptedActions` for a partial game.
- Exactly one trace row per attempted decision. If the failure occurs before the row is pushed, append a failed-attempt row. If the row is already present, annotate that same row; never duplicate it.
- Every attempt captures its `fullStateBefore` and actor-visible observation/prompt context as soon as those are available, before decoding/dispatch.
- On failure, always capture a fresh `failure-final` full-state snapshot when the diagnostic callback exists, regardless of whether a previous row already has `fullStateAfter`.
- Full-state snapshots remain analyst-only; actor observation and prompt-resolution inputs remain separate fields.

## Failed row shape

A failed pre-dispatch attempt should be represented explicitly, for example:

```js
{
  actionOrdinal: 2,
  actingSeat: 0,
  actingPlayerId: 'player-id',
  turn: 3,
  phase: 'player-turn',
  policyInputKind: 'actor-observation',
  dispatchStatus: 'not-dispatched',
  actionName: null,
  actionPayload: null,
  publicStateBefore: { /* actor/public zones */ },
  actorObservationBefore: { /* exact base actor view, if available */ },
  fullStateBefore: { /* private analyst-only snapshot */ },
  fullStateAtFailure: { /* freshly captured failure-final snapshot */ },
  failure: {
    stage: 'policy-decode',
    name: 'Error',
    message: 'redacted diagnostic message'
  }
}
```

This is an illustrative schema only. A failed prompt decode should use its own `policyInputKind` and prompt snapshot/context. If an action has already been decoded but trace preparation fails, preserve the decoded action identity/payload if available while still marking it `not-dispatched`.

For a `Store.dispatch` error, retain the already-pushed row and preserve the helper's current `dispatchStatus:'failed'`; do not append a duplicate. For an `onAction` error after successful dispatch, retain the row as `succeeded` and attach the callback failure without adding another attempt.

## Minimum regression matrix

1. **First decode failure:** accepted 0, attempted 1, one failed row with pre-state and fresh failure-final state.
2. **Failure after one successful dispatch:** accepted 1, attempted 2, two rows; the failed second row has its own pre-state, and the final snapshot is freshly captured after the thrown decode. Mutate a harmless diagnostic state field before throwing to prove freshness.
3. **Trace-preparation failure:** append one not-dispatched row and preserve any decoded action identity/payload plus pre-state.
4. **Dispatch failure:** no duplicate row; record dispatch failure and fresh final state even if partial mutation occurred.
5. **Post-dispatch callback failure:** no duplicate row; preserve successful dispatch status and attach callback failure.
6. **Action cap:** no synthetic decision row; attempted count equals actual rows and the cap remains the failure stage.

The failed-attempt row must not be counted as accepted, and a decode failure with no decoded action should keep `failedAction:null`. This contract is about evidence completeness, not competitive strength.
