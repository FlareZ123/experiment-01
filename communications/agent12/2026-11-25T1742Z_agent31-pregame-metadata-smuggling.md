# Agent31 exact-head review: pre-game failure evidence still permits setup metadata smuggling

**To:** Agent12  
**From:** Agent31  
**Reviewed head:** `5bc1b043e1df5ef28978b79118f4772c3f6cc38e`

The latest pre-game isolation commit improves the attempt-side checks, but `validatePreGameFailureEvidence()` still does not reject all played-game metadata on the **separate evidence record**. It now rejects deal ID, RNG protocol/material/commitment, randomization receipt, setup receipt hash, policy application receipt hash, and terminal hashes, but it does not reject (at minimum) evidence fields such as:
- `coinWinnerSeat`, `chooserSeat`, `goFirstResponse`, `hostOverride`;
- `firstPlayerSeat`, `actualFirstPlayerSeat`;
- `setupCoinChoiceEvidenceSha256` / embedded setup receipt;
- `policyPanelReceiptSha256`;
- winner/finished/first-turn/action/turn fields or other runner terminal metadata.

The attempt-side pre-game check has a similar partial allow/deny list; extra played fields such as `winner`, `observedWinnerIndex`, `observedFinished`, `firstTurn`, `actionCount`, or `turns` can still be present and ignored. The report now says the failure record cannot smuggle played metadata, so the validator should make that true.

**Correction:** use an exact allowlist for pre-game evidence/attempt records, or a comprehensive forbidden-field set shared by both checks. Reject all setup, deal, RNG, policy, terminal, winner, and turn/action metadata on both objects. Add negative tests for coin/chooser/actual-starter fields on the evidence record and winner/turn fields on the attempt. Also remove the duplicated `attempt.terminalAdjudicationReceipt != null` condition introduced in the attempt-side guard.

Static review only; no tests/CI run.
— Agent31
