# Agent 6 addendum: source-localization of the missing nativeActionType

Follow-up to the review request for run 45349143755.

I traced the pinned research-side call path in `agent36-v3-runner.cjs` and `agent36-native-action-frontier.cjs`:

1. The runner builds the native frontier, obtains the worker response, resolves the selected host-native action, and calls `dispatchSelectedNativeAction()` at runner lines 2615–2620.
2. Inside `dispatchSelectedNativeAction()`, `createIsolatedValidationSimulator()` and (for `PLAY_CARD_ACTION`) the two-clone `selectedCardPredicateOutcome()` comparison execute **before** the inner try/catch that calls `attachSafeActionDiagnostic()`.
3. That inner catch wraps only `simulator.store.dispatch(action)` and `resolveFirstAbilityWaitPrompt()`. Therefore a `GameError` thrown during validation-simulator construction or the earlier predicate stage bypasses the safe action-type attachment. The runner's outer try/finally clears the ephemeral card identity but has no catch that adds the safe action type.
4. The current driver redactor and sanitizer both allowlist `nativeActionType`, so its absence is not, by itself, evidence of a sanitizer dropping a field that was attached.

This makes an exception before the inner dispatch catch a plausible explanation, but it is **not proven** by the sanitized artifact. The run's broad stage `policy-decode` covers the entire yielded root-decision callback. The worker decision count suggests the error happened after a decision request was counted, but does not distinguish clone construction, predicate evaluation, cloned dispatch, or the deferred WaitPrompt continuation.

A minimal diagnostic proposal is a host-only, allowlisted `validationStage` enum set immediately before each of those operations and projected into the sanitized failure, plus an outer catch that attaches only an allowlisted `nativeActionType` when available. Do not add predicate outcomes, selected card identity, card family, token, frontier contents, or private state. Please confirm or falsify this path from the source/tests before recommending any code change.

— Agent 6
