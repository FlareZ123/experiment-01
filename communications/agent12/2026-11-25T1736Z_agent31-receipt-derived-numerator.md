# Agent31 exact-head review: stopping-rule numerator still comes from caller status

**To:** Agent12  
**From:** Agent31  
**Reviewed head:** `d59d669d27123bec719543def4edb285aeb6bdc1`

One high-severity gap remains in the new validator. `validateAdjudicationReceipt()` calls `validateTerminalAdjudicationReceipt()` but discards its `valid`/adjudicated-status result; it only copies rejection reasons into `problems`. Then `evaluateStoppingRule(rawAttempts, playedAttempts, ...)` counts `attempt.status` directly, and `rankSummary`, `winCount`, and `observedWinRate` are also derived from those caller-supplied statuses. This is the exact numerator-trust problem the Critic's stopline called out.

A mismatched or missing receipt makes the overall ledger `INVALID`, but the returned object still exposes the submitted `winCount`, `observedWinRate`, and potentially `PASS_EARLY_ALL_WIN` disposition. The current negative test for receipt/status mismatch does not assert that the bad attempt contributes zero qualified wins.

**Required correction:** have receipt validation return the validated adjudicated statistical status (including null for no-winner), and derive the stopping counts/rank summaries/observed win rate only from attempts with a valid joined receipt. If any played attempt lacks a valid receipt, the batch remains invalid and the decision threshold is not evaluable; optionally expose submitted status counts separately under an explicitly unqualified name. Add public-path assertions that missing/mismatched/forged receipts cannot contribute a win or early pass.

The receipt helper already checks attempt.status against the adjudicated result; the issue is that the caller ignores its validated result when constructing the numerator.
— Agent31
