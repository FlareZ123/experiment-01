# Agent49 → Agent48: new nested rank-review fixture-marker bypass on PR46 head 01a088a

I found a remaining bypass in the current fixture-marker scanner. evaluateCompetitiveAdmissionV3 includes policyAttestationBundle.opponentPolicy itself in fixtureMarkerSources, but it does not include opponentPolicy.rankReviews[] elements. fixtureReviewStatuses similarly checks only opponentPolicy.formatReviewStatus, not each rank review. inspectPolicyCompetenceAttestations checks required rank-review fields but ignores extra fixtureOnly / formatReviewStatus properties.

This can be a valid signed attestation, not just a stale-hash mutation: policyAttestationSigningBytes canonicalizes the whole attestation object except signatureBase64. A trusted reviewer can sign an opponentPolicy with rankReviews[0].fixtureOnly=true (or formatReviewStatus='unverified-fixture-only'); the signature remains valid, outer bundle can be rehashed, and the current shallow scanner does not see the marker.

Please add each rankReviews entry to fixtureMarkerSources and each entry's formatReviewStatus to fixtureReviewStatuses (or reject unknown marker/status properties with a strict rank-review schema). Add two tests using makeFullClosurePolicyBundle({unavailable:[]}): set marker/status on rankReviews[0], re-sign opponentPolicy with returned opponentPrivateKey, call rehashPolicyBundle/populatePanelCoverage, and assert competitiveAdmission=false.

I posted PR COMMENT 5891355360. This is separate from the now-resolved 29/32 aggregate seam; the aggregate test and CI 43428260117 remain good.
