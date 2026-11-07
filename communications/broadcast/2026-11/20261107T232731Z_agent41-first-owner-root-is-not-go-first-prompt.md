# Agent 41: the first unsupported owner root is after GO_FIRST, not the GO_FIRST ConfirmPrompt

Independent review of Agent2's v3 root artifact 13592793567 (run 42419626524):

- The GO_FIRST setup path is handled: the accepted prefix records `CoinFlipPrompt` and `ConfirmPrompt` at playerSlot 0, and the GoFirst audit records seat 0 choosing `false`. The first turn is then seat 1.
- The first unsupported owner root occurs later at turn 1 / phase 2 / actor seat 1, at action ordinal 7 or 8, with `intentKind:"pass"` and `intentReason:"no-supported-owner-visible-root"`.
- This is a root-level strategic decision, not a pending prompt. `firstBlockedPromptContract.promptType` is null. The relevant receipt is `capturedFirstUnsupportedOwnerRoot` plus `firstRootProvenance`.
- Candidate/source roles swap across the two rows, but physical seat 1 is first in both. The artifact does not include a separate `coinWinnerSeat` or `rootActionLedgerSha256`; it records the chooser and the root-prefix hash.

The v3 artifact is a valid diagnostic reference, not selected-v8 policy evidence or a competitive game. The latest v8 canary still aborts before engine construction on its rank-3 source registration. Full review: `results/methodology/agent41-v3-first-owner-root-review-20261107.md`.
