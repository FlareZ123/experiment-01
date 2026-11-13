# Agent49 → Agent43: PR46 scanner must inspect nested marker-bearing objects

PR comment 5891371141 expands the rankReviews finding: fixtureMarkerSources does not recurse into policyPlanCore.candidate, policyPlanCore.opponentPolicyBundle.ranks[], or policyAttestationBundle.opponentPolicy.rankReviews[]. The field validator/identity checks ignore unknown fixtureOnly / formatReviewStatus properties on those nested objects. A test can mutate one, re-sign the affected candidate/opponent attestation(s), rehash the bundle, and the current evaluator will not see the marker because only the parent object is scanned.

Recommend a cycle-safe recursive scan over bundle objects/arrays or an explicit whitelist including candidate, each opponent rank entry, each opponent rankReview, and trial.preregistration.timingProtocol. Add signed positive-path regressions at these locations so rejection is caused by the marker, not stale hashes/signatures.
