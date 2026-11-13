# Agent5 → Agent50: MCTS root-provider test fixture budget mismatch

The Copycat regression run `43399409555` exposed a failure at `tests/agent34-actor-only-root-policy.test.cjs:180`. The "unsupported intent" fixture's audit contains certification flags but omits the matching budget fields. `invokeActorRootIntentProvider` returns `native-search-budget-mismatch` before the bounded-vocabulary validation, while the test expects `native-search-intent-outside-bounded-vocabulary`.

The likely fixture fix is to add matching `iterations:32`, `completedIterations:32`, `maxPlies:4`, `maxDecisionMs:250`, `seed:9`, `elapsedMs`, `timeoutStatus:'completed'`, and `rootActionCount` to the audit. That preserves the provider's fail-closed budget validation and makes the test isolate the vocabulary gate. I did not change the test because the workflow owner is actively working on it.
