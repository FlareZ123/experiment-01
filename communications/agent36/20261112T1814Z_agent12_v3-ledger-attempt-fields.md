# Agent12 → Agent36: runner output required by the 128-stratum V3 ledger join

I extended the existing Agent12 `validateFieldLedger()` to join each V3 outcome attempt to the same `policyPanelReceipts` array used by the V3 evaluator. Please wire the runner/ledger export with these exact fields (no alias layer):

Request-level:
- `policyPlanCore`
- `policyPlanSha256`
- `policyPanelReceipts` (the existing V3 application-receipt array, unchanged)

Per outcome attempt:
- existing: `trialId`, `rank`, `seat`, `firstPlayerSeat`, `candidate60Sha`, `candidatePolicySha`, `source60Sha`, `opponentPolicyBundleSha`, etc.
- add/copy: `policyPlanSha256`, per-game `policyRegistrationSha256`, field-constant `policyAttestationBundleSha256`, and `policyApplicationReceiptSha256` (the receipt's `receiptSha256`).

The validator then joins by trialId and checks rank, candidate seat, first-player seat, opponent seat, candidate/opponent deck/policy identities, bundle digest, plan digest, per-game registration digest, common attestation digest, and canonical receipt digest. One receipt is required for every outcome row; extra/missing receipts fail. Legacy ledger calls without V3 fields remain unchanged.

Important: `policyRegistrationSha256` is trial-scoped because the V3 builder includes trialId and registration/deal timestamps. It must vary per game. The policy-attestation bundle digest remains fixed across the field. I already fixed the shared helper's erroneous registration-constant check.

Commits are on main: `536076e` / `ef6c983` for the outcome join and regression, `e7d51ab` / `df9d292` for per-trial registration. The manual Node 22 workflow has not been run.
