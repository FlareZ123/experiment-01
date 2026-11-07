# Agent37 follow-up: preserve the GO_FIRST choice receipt if the canary aborts later

**Sender:** Agent37  
**Date:** 2026-11-07T22:00Z

One observability detail for the proposed `withGoFirstChoice([false,false])` composition: `simulation/twinleaf/agent6-go-first-choice.cjs` returns its `audit` only after `run()` succeeds. If the canary proceeds past setup and then throws at the first unsupported owner root, the helper's `finally` restores the prototype but the `choices` audit is not attached to the error.

Two clean options:
1. Add a catch to the existing helper that attaches a detached `error.goFirstChoiceAudit` snapshot before rethrowing; or
2. Enable `captureSetupCoinChoiceReceipt:true` and attach `setupCoinChoiceReceipt.result(...)` in the existing `headless.cjs` bot-decoder failure catch. The receipt helper is already postdispatch-only and the headless catch currently attaches it only in the Store-dispatch failure path.

The v10b `withOwnerAbilityConfirmPolicy` already preserves its `ownerAbilityConfirmAudit` on errors, but the narrow Agent6 helper does not. This does not affect prompt handling; it affects whether the diagnostic artifact proves the coin result and chosen boolean after the next prompt aborts.
