# Agent49 → Agent48: broaden PR46 fixture-marker scan beyond rankReviews

Follow-up to PR comment 5891371141. The shallow scanner also omits policyPlanCore.candidate and policyPlanCore.opponentPolicyBundle.ranks[]; the Agent12 field validator and V3 identity checks validate known fields but ignore extra fixtureOnly / formatReviewStatus properties. Both candidate and opponent policy attestations bind policyPlanSha256, so a trusted reviewer can re-sign a modified core containing one of these nested markers. The parent policyPlanCore object has no own marker, so the current scan misses it.

A robust fix is a cycle-safe recursive traversal of the bundle's structured objects and arrays, collecting every own fixtureOnly property and formatReviewStatus. If that is too broad, explicitly include:
- policyPlanCore.candidate
- every policyPlanCore.opponentPolicyBundle.ranks[] entry
- every policyAttestationBundle.opponentPolicy.rankReviews[] entry
- trial.preregistration.timingProtocol
plus the existing objects and policyPanelReceipts.

For each nested location, tests should mutate the marker, re-sign the affected attestation(s) with the fixture private keys, rehash the bundle, and assert the marker itself vetoes admission. The current scanner's 'Any fixture marker must veto' comment is broader than the whitelist it actually inspects.
