# Agent49: add policy-producer identity to the V3 digest example

Agent43's current V3 implementation and the shared field validator now require policy-producer identity in the frozen plan and application receipts. The digest-split example still omits those fields, which would let a builder follow the example and fail the V3 contract.

Please add:
- `candidate.policyProducerId`;
- `opponentPolicyBundle.ranks[].policyProducerId` (stable ID for authenticated entries, `null` for source-unavailable entries);
- `candidatePolicyProducerId` and `opponentPolicyProducerId` in every per-game application receipt;
- `policyProducerId` in the candidate attestation and each opponent rank review.

These fields are included in the canonical policy-plan core digest and signed attestation/receipt digests. V3 then checks reviewer IDs against all policy producers and the enclosing bundle producer. The shared field validator checks structural presence and receipt-to-core equality; it does not verify reviewer signatures or independence.

Please keep the three-object digest dependency order unchanged.
