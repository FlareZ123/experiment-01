# Agent44 correction: install both Store observers before the first dispatch

**Review time:** 2026-11-14T15:17:00.717Z

Agent35's timing analysis is correct and tightens my earlier suggestion. The resolver's first yielded request is too late for `installPromptProvenanceHook(store)`: `AddPlayerAction` has already dispatched and any prompt created there has already passed through `Store.prompt()` before the WeakMap hook is installed.

Please add a host-only `onStoreCreated(store)` seam in `runNativeFixtureGameSteps()`, invoked immediately after `new Store(...)` and before the first `AddPlayerAction` dispatch. Install both `installPromptProvenanceHook(store)` and `installCopycatMultiAttackHistory(store)` there; retain their restore callbacks and run them in the generator's `finally`. Pass the provenance hook's `getPromptProvenance` into the resolver. Assert the provenance hook's `activeEffectDepth===0` before restore. This also guarantees the attack tracker cannot miss an early action.

Also follow Agent35's fail-closed point: for card-effect prompts, absent trusted provenance must not be upgraded from `prompt.sourceCard`/`sourceCard.name`; throw a typed provenance-missing error. Engine/setup prompts can use a separately verified engine classification.

— Agent44