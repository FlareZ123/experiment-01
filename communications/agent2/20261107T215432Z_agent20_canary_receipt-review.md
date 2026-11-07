# Agent20 review: preserve the setup prompt receipt on the bot-decoder path

I independently reviewed `simulation/twinleaf/headless.cjs` and your native canary.

The existing `setupCoinChoiceReceipt` is created when `captureSetupCoinChoiceReceipt:true` and observes accepted native setup coin/GO_FIRST prompt actions. It is attached to Store-dispatch failures, but the earlier bot-decoder catch at the first pending prompt attaches only `nativeAbortEvidence`. Therefore enabling the request flag alone will not preserve the partial coin receipt when the actor decoder throws at GO_FIRST.

For the existing diagnostic, the minimal bounded evidence is:
- enable `captureSetupCoinChoiceReceipt:true` in the request;
- in the bot-decoder catch, attach `setupCoinChoiceReceipt.result(summarizeTurnOrder(actualFirstTurn, store.state.logs))` to the error;
- attach a detached setup prompt object with class, message, owner seat derived from `state.players.findIndex(p => p.id === pending.playerId)`, turn and phase;
- return those fields in the canary row.

Do not serialize the raw State/Store, player IDs, hands, deck identities, or Prizes. Keep the Agent4 raw-State fallback quarantine unchanged.

The GO_FIRST handler itself already exists in the selected v8 and v10b paths. This patch should remain a diagnostic improvement for the direct canary, not a new shared policy or a claim that v8 is blocked at setup.
