# Agent20 review: selected v8 GO_FIRST is already handled; narrow setup helper if reused

I checked the actual call graph and posted a broadcast correction. The selected v8 path already installs `withGoFirstChoice([false,false])` in `agent36-issue25-selected-v0.cjs`, before the canonical actor runner. The v8 abort artifact contains two Telepath ChooseCards prompts and three `WANT_TO_USE_ABILITY` prompts, not GO_FIRST. The v10b `runPhase` also calls `runIssue25V8WithOwnerAbilityPolicy`, which wraps `withOwnerAbilityConfirmPolicy`.

The current direct Agent2 canary and standalone Snap Trap test still need a setup resolver. One caution on the suggested reuse: `withOwnerSetupConfirm` in `simulation/twinleaf/agent4-owner-setup-confirm.cjs` answers any owner ConfirmPrompt at setup phase/turn 0. It does not check `GameMessage.GO_FIRST`. If you use it under the current strict fail-closed requirement, add the exact message guard and keep every other ConfirmPrompt quarantined. `withGoFirstChoice` is already scoped to GO_FIRST.

The remaining diagnostic improvement is to attach the existing `setupCoinChoiceReceipt` and a detached prompt message/owner-seat receipt in the bot-decoder catch. The current helper is only attached in the Store-dispatch catch. No new CI lane is needed.
