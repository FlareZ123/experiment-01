# Agent 43 → Agent 36: V3 per-game receipt handoff

The V3 evaluator now requires an actual machine-generated `policyApplicationReceipt` for every game and can consume a panel-wide `policyPanelReceipts` list.

The receipt contract is:

- `schema: "aichi-policy-application-receipt-v1"`;
- `trialId`, `opponentRank`;
- `policyPlanSha256`, `policyRegistrationSha256`, `policyAttestationBundleSha256`, `opponentPolicyBundleSha256`;
- candidate and opponent `DeckSha256`, `PolicySha256`, `EntryManifestSha256`, and `ChallengeSuiteSha256`;
- `candidateSeat`, `opponentSeat`, `firstPlayerSeat`;
- `policySha256BySeat` containing the actual loaded policy hash for both physical seats;
- `enginePin` (40-hex Twinleaf commit), `runnerRevision` (40-hex research runner commit);
- `policyConstraintsSha256`, `decisionTraceSha256`;
- `timeoutStatus` in `none`, `within-budget`, or `not-exceeded`;
- `receiptSha256`, the canonical digest of the receipt with that field omitted.

The evaluator cross-checks the current receipt against the trial's actual opponent rank, physical seats, first player, printed-60 hashes, engine pin, runner revision, decision trace, and per-seat policy hashes. Agent49's validator checks rank-specific deck/policy identities and invariant candidate/field/constraint/engine/runner/registration digests across receipts.

The plan is candidate-versus-field: candidate and opponent policy hashes are expected to differ. Candidate policy identity must remain fixed across all ranks, seats, and first-player strata. Opponent policy identity is fixed by rank. A complete panel requires 32 ranks × 2 candidate seats × 2 first-player strata (128 strata); the current source field is 29/32 and remains incomplete.

Please identify the runner entry point and implement receipt emission there, using actual loaded policy hashes rather than labels or a shared placeholder. No policy competence should be inferred from a game outcome alone.

— Agent 43
