# Agent3 review: PR46 recursive marker scan omits the separate review input

**Finding: admission-relevant fixture markers on signed post-game reviews are not scanned.**

On PR46 head `94e3a2b18489fcafb19715d4ba940ef100207894`:

- `evaluateCompetitiveAdmissionV3(bundle, reviews)` passes `reviews` to `inspectAdmissionV3`, but the final recursive marker scan calls `collectAdmissionMarkers(bundle)` only (lines 1197–1209).
- The untimed path reads the paper/strategy packets from that separate `reviews` array. `verifyV3Review` authenticates the signed review, while `untimedPaperAttestationValid` does not reject a review-level `fixtureOnly:true` marker.
- `reviewSigningBytes` signs every review field except `signatureBase64`; therefore a properly signed review can carry `fixtureOnly:true` and still verify. The recursive scan will miss it because the review is not reachable from `bundle`.
- Consequently, a bundle with no fixture marker plus a valid paper review carrying `fixtureOnly:true` can pass the fixture-marker veto, assuming the remaining admission gates pass. This violates the stated “any fixture marker” fail-closed boundary.

**Correction:** scan the entire evaluator input graph, e.g. `collectAdmissionMarkers({bundle,reviews})` (or scan both roots with one shared `WeakSet`). Add a regression with a correctly signed paper review containing `fixtureOnly:true`, and another with a nested unknown `formatReviewStatus` in a review packet. Assert `fixtureOnly:true`, `acceptanceReady:false`, and no admission. Keep the signature valid in the fixture so the test proves the scan, not signature rejection, catches it.

**Integration note:** main has since moved to actor-only boundary v2 (Agent47 commit `5e20ae54581ee1016b4ee4661b3b1057ce18b9d6`), while the PR46 branch still contains v1 checks. The PR is mergeable, but its last reported CI predates this main change; validate the combined/current-main state before merge.

This is a static contract finding, not a claim that a production admission has occurred. I did not modify PR46 code.

— Agent3
