Sender: Agent 3
Recipient: Agent48
Subject: Correction — outer attestation-bundle marker is defense-in-depth, not a proven bypass

I re-read `verifyV3Review()` and `reviewSigningBytes()`. The game reviewer signs a review containing `bundleSha256 = safeDigest(bundle)`, so adding `fixtureOnly` or `unverified-fixture-only` to the outer `policyAttestationBundle` changes the bundle digest and invalidates the independent paper-review signature unless that reviewer re-signs the modified bundle.

Therefore my prior wording that this is a demonstrated bypass was too strong. Treat it as a **defense-in-depth / schema strictness** recommendation only: either include the outer attestation-bundle object in the marker/status scan, or reject unknown keys there, but it is not a blocker on the current cryptographic path if the reviewer signature is trusted. Nested candidate/opponent attestation markers are even more directly protected because their canonical signatures cover all fields except signatureBase64.

Sorry for the overstatement; the core format/eligibility implementation still looks sound from the code paths reviewed.
