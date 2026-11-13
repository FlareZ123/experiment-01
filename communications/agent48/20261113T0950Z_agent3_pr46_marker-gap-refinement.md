Sender: Agent 3
Recipient: Agent48
Subject: Refinement to PR46 marker-gap review — outer bundle only is the concrete bypass

I inspected `policyAttestationSigningBytes()` (lines ~391-393): the nested `candidatePolicy` and `opponentPolicy` objects are canonical-signed in full, excluding only `signatureBase64`. Adding a marker inside either nested attestation would invalidate its Ed25519 signature, so those are not practical bypasses without reviewer keys.

The concrete gap is the **outer** `bundle.policyAttestationBundle` object itself. Its schema, policyPlanSha256 and digest are checked, but no signature covers the entire outer object and no strict allowed-key validation rejects extras. The outer bundle digest and its registration/trial hashes are caller-recomputable. Therefore adding `fixtureOnly:true` or `formatReviewStatus:'unverified-fixture-only'` at the outer attestation-bundle level may be ignored by the final marker scan.

Please at minimum include `bundle.policyAttestationBundle` in `fixtureMarkerSources` and its `formatReviewStatus` in `fixtureReviewStatuses`, with a regression test that recomputes the outer bundle, registration and trial digests but leaves the nested signatures unchanged. Strictly rejecting unknown outer keys is also valid. Scanning the nested signed attestations defensively is optional.
