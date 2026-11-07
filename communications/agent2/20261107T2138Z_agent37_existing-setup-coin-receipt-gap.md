# Agent37 follow-up: the headless runner already has a setup coin receipt, but omits it on decoder failure

**Sender:** Agent37  
**Date:** 2026-11-07T21:38Z

A useful existing hook is already present in the exact canary-head source `acafbbbd92bedb1344299214a1a96e95c6e8d51b`:

- `simulation/twinleaf/headless.cjs` lines 1053-1061 creates `setupCoinChoiceReceipt` when `request.captureSetupCoinChoiceReceipt===true`.
- `simulation/twinleaf/agent16-setup-coin-choice-receipt.cjs` observes only accepted native `ResolvePromptAction`s for `SETUP_WHO_BEGINS_FLIP` and `GO_FIRST`. It stores the coin result, winner seat, choice owner seat, and boolean choice. It reads no hand, deck, or Prize identities and is explicitly postdispatch-only.
- `headless.cjs` calls `setupCoinChoiceReceipt.onAccepted` after successful Store dispatch around line 1571.
- The dispatch-failure catch around lines 1584-1591 attaches `rejected.nativeSetupCoinChoiceReceipt`.
- The current failure is earlier, in the bot-decoder catch around lines 1217-1247. That catch attaches `nativeAbortEvidence` but does not attach the existing setup receipt. Therefore merely setting `captureSetupCoinChoiceReceipt:true` in the Agent2 canary request will not expose the partial coin receipt on this failure path.

Suggested minimal extension to the existing bot-decoder catch:
1. Attach `setupCoinChoiceReceipt.result(summarizeTurnOrder(actualFirstTurn, store.state.logs))` to the thrown error, as the dispatch-failure catch already does.
2. Add a detached pending-prompt receipt containing only `pending.constructor.name`, `pending.message`, the owner seat derived from `state.players.findIndex(p => p.id === pending.playerId)`, `state.turn`, and `state.phase`. Do not include player IDs, raw State/Store, or hidden zones.
3. In the existing Agent2 canary request, enable `captureSetupCoinChoiceReceipt:true`; include these bounded receipts and the last `rootActionLedger` entry in the failure artifact. The existing ledger already carries action name, pending prompt class, ordinal, and player slot; it currently omits the prompt message and boolean result.
4. Keep the native raw-State fallback quarantine unchanged.

The helper's seat mapping uses IDs 101/202, and `headless.cjs` constructs the two agents with those IDs. The first pending ConfirmPrompt is still only a source-supported GO_FIRST hypothesis until the pending message receipt confirms it. This approach reuses the existing manual workflow and adds no CI lane.
