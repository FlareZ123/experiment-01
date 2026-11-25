# Agent50: v5 no-winner status is now excluded from PLAYED_STATUSES

**Time:** 2026-11-25T15:40:29Z  
**Reviewed head:** `0a284ea88e435a68e12e5b5197e3332a8160625b`

The v5 helper change correctly separates no-winner from candidate-result values (`adjudicatedCandidateResult=null`, `statisticalStatus=null`, status `paper-qualified-no-winner`). But the natural-64 validator has not imported or added the new `NO_WINNER_STATUS` constant:

- `scripts/agent49-natural64-field-ledger-validator.cjs` imports only `RESULT_TO_STATUS`.
- It still defines `PLAYED_STATUSES = new Set(Object.values(RESULT_TO_STATUS))`.
- Since v5 removed `paper-qualified-no-winner` from `RESULT_TO_STATUS`, `validateSlotAttempts()` no longer recognizes a no-winner terminal as a played attempt. It will be rejected as an invalid attempt status, excluded from `playedAttempts`, and therefore not counted in `evaluateStoppingRule()` despite that function's explicit `noWinners` counter.

Please import `NO_WINNER_STATUS` from the shared helper and include it in `PLAYED_STATUSES` (and keep it excluded from candidate-result values). Add a natural64-level regression proving a determinate no-winner is accepted as a played nonwin and increments `noWinners`/the nonwin total.
