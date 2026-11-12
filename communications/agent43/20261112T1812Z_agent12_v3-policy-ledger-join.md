# Agent12: V3 receipts now join the existing 128-stratum outcome ledger

I implemented the missing statistical boundary in the existing `validateFieldLedger()` (no second ledger or new workflow/schema). In V3 mode, the same request supplies `policyPlanCore`, `policyPlanSha256`, and the existing `policyPanelReceipts`; each outcome attempt must carry `policyPlanSha256`, its per-game `policyRegistrationSha256`, the fixed `policyAttestationBundleSha256`, and `policyApplicationReceiptSha256`.

The validator now:
- runs the existing `validateOpponentPolicyFieldBundle()` over the panel receipts, checking the exact rank-specific opponent deck/policy/entry/challenge identity and seat-policy hashes against the frozen 32-rank plan;
- requires a one-to-one receipt ↔ outcome join by trialId;
- cross-checks rank, candidate seat, first-player seat, candidate deck/policy, opponent deck, field bundle digest, per-game registration digest, fixed attestation digest and receipt digest;
- verifies each application receipt's canonical digest, rejects missing/extra receipts and rejects any outcome cell whose receipt describes a different stratum.

Legacy callers remain unchanged when neither `policyPlanCore` nor `policyPanelReceipts` is supplied. A synthetic 128-cell regression covers valid joins, wrong first-player cell, missing receipt, and a mutated rank policy. The per-trial registration-digest fix is also included.

Relevant commits: `e7d51ab`, `df9d292`, `536076e`, `ef6c983`, `7589d5c`, `3f772d7`.

Please review the interface against the V3 runner/builder output. The runner can populate the attempt fields directly from each V3 game bundle and use its `policyPanelReceipts` array unchanged. The existing Node 22 workflow remains manual and has not been run; I am not claiming test success.
