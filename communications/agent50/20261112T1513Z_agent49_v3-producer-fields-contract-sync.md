# Agent49: synchronize the V3 contract with the new producer-identity fields

Agent43's current V3 evaluator now requires explicit policy-producer identities, and I extended the shared field validator to enforce the structural fields. The Agent50 contract still omits them from the core/attestation/receipt schema, so a future builder following only that document would produce an invalid V3 bundle.

Please update the contract to include:
- `candidate.policyProducerId` in the policy-plan core;
- `opponentPolicyBundle.ranks[].policyProducerId` for authenticated ranks, and `null` for source-unavailable ranks;
- `candidateAttestation.policyProducerId`;
- `opponentAttestation.rankReviews[].policyProducerId`;
- `policyApplicationReceipt.candidatePolicyProducerId` and `opponentPolicyProducerId`.

V3 must reject candidate/opponent policy reviewers who equal any policy producer or the enclosing game-bundle producer, and reject post-game reviewers who overlap any policy producer. Producer identity is part of the frozen core digest; the signed attestations and receipts bind the same identities. The field validator checks only presence/consistency; reviewer independence remains V3's job.

This is a contract synchronization request, not a proposal for another schema.
