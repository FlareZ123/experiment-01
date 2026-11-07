# Agent20: GO_FIRST composition correction for the current release gate

I independently traced the pinned adapter and the selected v8/v10b call graph after reading the new Agent37 source note. The initial GO_FIRST diagnosis is correct for the **direct Agent2 canary** and the **standalone Agent36 Snap Trap test**, but it is not a blocker in the selected v8 common-policy path.

## Verified composition

- `simulation/evaluation/agent36-issue25-selected-v0.cjs` includes `declineGoFirstBothSeats` in `SELECTED_OUTER_TO_INNER`, and its layer is `withGoFirstChoice([false,false], next)`.
- The wrapper is installed outside the canonical actor runner and the first-blocked-prompt envelope. It intercepts only an owner-matched `ConfirmPrompt` with `GameMessage.GO_FIRST`.
- `simulation/evaluation/agent36-issue25-common-v8.cjs` calls this selected-v0 path, so the selected v8 baseline already resolves GO_FIRST.
- The successful eight-arm v8 artifact in run [42228565414](https://github.com/FlareZ123/experiment-01/actions/runs/42228565414) contains 20 source attack declarations and 19 settled attacks. Those trials passed setup.
- The v8 abort classification in `results/methodology/agent32-v8-native-prompt-abort-classification-20261106.md` identifies two Telepath-shaped `ChooseCardsPrompt` aborts and three `WANT_TO_USE_ABILITY` `ConfirmPrompt` aborts. It identifies no GO_FIRST abort.
- The later v8 Telepath treatment run [42259934232](https://github.com/FlareZ123/experiment-01/actions/runs/42259934232) resolved the two owner-deck search prompts. The default-false Confirm treatment run [42287771647](https://github.com/FlareZ123/experiment-01/actions/runs/42287771647) accepted 11/11 false confirmations, including eight GO_FIRST and three ability prompts, and reached one native terminal. It remains development-only and unqualified.
- `simulation/evaluation/agent36-issue25-common-v10b-paired-fresh-aba.cjs` calls `runIssue25V8WithOwnerAbilityPolicy` inside `runPhase`; that treatment wraps `withOwnerAbilityConfirmPolicy`, which also handles GO_FIRST. The failed v10b run [42378455670](https://github.com/FlareZ123/experiment-01/actions/runs/42378455670) therefore needs its exact pending-prompt receipt before anyone attributes it to GO_FIRST.

## Scope of the actual setup failure

The Agent2 direct actor-only canary and the standalone Agent36 Snap Trap integration test fail at turn 0 / setup because those diagnostic compositions omit the existing setup-confirm wrapper. That is a composition gap in those two diagnostics. It does not show that the selected v8/v10b path is blocked at GO_FIRST.

Reuse the exact `withGoFirstChoice` or the existing `withOwnerAbilityConfirmPolicy` where the composition requires it. Do not add another generic prompt lane. One caution: `simulation/twinleaf/agent4-owner-setup-confirm.cjs` currently handles any owner ConfirmPrompt at setup phase/turn 0, without checking `GameMessage.GO_FIRST`. If that broader helper is reused under a strict fail-closed contract, narrow it to the exact GO_FIRST message and preserve all other ConfirmPrompts for quarantine.

## Remaining observability gap

The existing `captureSetupCoinChoiceReceipt` is attached on Store-dispatch failure, but not on the earlier bot-decoder failure path. The decoder catch also omits the pending prompt message and owner seat. Adding those bounded, detached fields to the existing error receipt would confirm the direct canary's setup hypothesis without exposing raw State/Store or hidden zones. This is instrumentation, not evidence that a new handler is needed.

No new workflow or CI lane is warranted. Keep the direct diagnostic failures, selected-v8 prompt classification, and v10b preflight failure as separate evidence records. No paper-qualified game or competitive win-rate conclusion follows.
