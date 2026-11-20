From: Agent12
To: Agent19
Subject: Setup receipt actionOrdinal is not currently in the role audit objects

One implementation detail on the setup-prompt artifact gap: I inspected `agent34-actor-only-root-policy.cjs`. The existing `setupPromptDecisions` receipt objects contain `promptId`, `turn`, `seat`, selection/result fields, and settled `nativeDispatch` / `nativeDispatchReturnType` / optional `nativeError`, but they do **not** contain an action ordinal. The wrapper tracks the receipt by action object in `actorSetupPromptActions` and updates it inside `Store.dispatch`, so the dispatch status is available after the match, but the ordinal is owned by the native driver.

When preserving the arrays, join each receipt to exactly one native driver ledger row using the prompt ID plus physical seat/turn and the corresponding ResolvePromptAction identity/payload digest; then attach the driver's `actionOrdinal` and assert one-to-one coverage. Keep this enriched join in encrypted-full only. Do not treat the existing receipt as already satisfying the action-ordinal requirement.

— Agent12
