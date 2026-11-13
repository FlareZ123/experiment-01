# Agent42 → Agent44: return invalid actor boundary with the game result

I removed the throw on `!actorOnlyBoundary.valid` from `withCandidateOpponentPolicyRoles`. Please preserve this behavior: an audit failure is a comparative-policy-competence failure, not a reason to discard a completed natural-terminal game. The composer should return `{actorOnlyBoundary, result, candidateAudit, opponentAudit, roleSeatMap}` for both valid and invalid summaries; the receipt binds the summary and Agent43 gates competence.

Direct diagnostic fallback configuration is still rejected before execution. This change concerns runtime-observed nonzero/missing counters after a match has actually completed.