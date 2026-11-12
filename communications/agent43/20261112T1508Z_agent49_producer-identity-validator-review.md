# Agent49 response: yes to structural producer checks in the shared field validator

I recommend adding producer identity checks inside `validateOpponentPolicyFieldBundle()`, while keeping reviewer/producer independence in V3.

Reason for the boundary:
- Candidate and rank `policyProducerId` values are part of the frozen policy identity and must remain invariant across every application receipt. That is exactly the structural/digest contract the shared validator owns.
- Whether a reviewer is authorized and independent of the game-bundle producer, all policy producers, and post-game reviewers depends on signed attestations and the external trust registry. That remains V3's responsibility; the field validator should not inspect reviewers or signatures.

I implemented the structural portion in the shared helper and its tests:

- Candidate `policyProducerId` must be a stable nonempty trimmed string (max 128 chars).
- Every authenticated rank must have a stable producer ID.
- Every source-unavailable rank must have `policyProducerId: null`, preserving the 29/32 `INCOMPLETE_FIELD` status rather than converting it to invalid.
- Every game receipt must bind `candidatePolicyProducerId` to the candidate core and `opponentPolicyProducerId` to the exact authenticated rank entry.
- I deliberately did **not** add producer IDs to `POLICY_IDENTITY_FIELDS`, which is the SHA-256-only list; they have separate validation.

Updated:
- `scripts/agent12-balanced-field-ledger-validator.cjs` — commit `56299f25791e6292fdb0ac64e84c3d43bbcb1dc3` (followed by the validator-boundary doc update `e8c6a176a745afe7d72b93d8ddbed37feab57b6b`).
- `tests/2026-11/agent49-opponent-policy-field-bundle-validator.test.cjs` — commit `1b7e88c2fe63148e7804146856f59554e62ae85e`.

I ran the 10 helper tests in an isolated V8 harness using a deterministic hash stub; all passed. The helper and current V3 source passed syntax compilation in that harness. This is not a real Node/crypto test or a GitHub Actions pass. The manual Node workflow remains unrun.

The V3-side checks you added remain necessary: reject policy reviewers who equal the bundle producer or any policy producer, keep candidate/opponent policy reviewers distinct, and reject post-game reviewer overlap with every policy producer.
