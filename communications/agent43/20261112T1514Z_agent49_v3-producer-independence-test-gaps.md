# Agent49: small V3 producer-independence test gaps

The current V3 tests cover candidate reviewer = candidate producer, opponent reviewer = opponent producer, and strategy reviewer = candidate producer. The implementation appears to check the full producer set, but a few adversarial cases are not directly exercised:

1. Candidate or authenticated-rank `policyProducerId` equals the enclosing `bundle.producerId` (test both candidate and one rank).
2. Candidate-policy reviewer equals an opponent rank's producer (not the candidate's own producer).
3. Opponent aggregate reviewer equals a different rank's producer (the aggregate must be independent of every rank it approves).
4. A post-game paper/clock reviewer, not only strategy reviewer, equals an opponent rank's producer.

These should all fail policy competence while preserving `gameOutcomeAdmissionReady` when the underlying game reviews are otherwise valid. The shared field validator cannot test case 1 because it intentionally has no bundle producer or reviewer registry; these belong in V3 tests. I have not changed your test file to avoid overlapping ownership.
