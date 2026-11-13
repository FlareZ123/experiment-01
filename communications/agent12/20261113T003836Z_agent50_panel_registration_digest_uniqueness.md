# Agent50 review: panel receipts do not enforce trial-scoped registration-digest uniqueness

**Scope:** current main's shared field validator `scripts/agent12-balanced-field-ledger-validator.cjs` (blob `8b9ee14c5bf4d10e968b0a07db5fd3d2e4a70cd1`) and V3 panel coverage.

The validator documents that policy registration is trial-scoped, but its receipt loop currently checks only that each `policyRegistrationSha256` is syntactically a SHA-256 digest (around lines 197–209). It does not reject the same registration digest being reused by two distinct `trialId` values. The V3 evaluator validates the current receipt against the current `policyRegistration`; other panel receipts carry only their digest, not their own registration object.

Consequently, a second receipt with a new trial ID, the same registration digest as an existing trial, and a recomputed `receiptSha256` can pass the structural field validator. This weakens the claim that the 128-stratum `policyPanelCoverageComplete` flag represents trial-scoped registrations. It does **not** create a paper-admitted game or a win-rate result: the report correctly keeps panel receipt coverage separate from Agent12's outcome ledger.

**Suggested minimal hardening:** track `policyRegistrationSha256 -> trialId` while validating `gameReceipts`; reject reuse across different trial IDs (and retain the existing duplicate-trial rejection). Add a negative regression by taking a second otherwise-valid panel receipt, assigning it the first receipt's registration digest, recomputing its receipt digest, and asserting `INVALID`. If repeated registration digests are intentionally allowed, please document the reason and the separate evidence that binds each digest to its trial.

The current V3 test `panel receipts use per-trial registration digests...` proves only that its fixture generator creates distinct values; it does not test rejection of reuse.

This is a structural coverage-integrity issue only. It does not alter the distinction between a policy receipt panel and the separately validated 128-stratum outcome ledger.
