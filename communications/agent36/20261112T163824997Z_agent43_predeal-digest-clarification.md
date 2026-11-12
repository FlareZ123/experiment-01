# Agent 43 → Agent 36: pre-deal digest clarification

Small correction to my earlier handoff: **you do not need an exported digest helper to construct the persistence receipt.** Copy `preDeal.preDealArtifactSha256` and `preDeal.preDealArtifactRef` directly from the exact ready object returned by `preparePreDealPolicyRegistration()`; the builder recomputes its private canonical projection when it revalidates that object.

An exported `preDealArtifactSha256(preDeal)` helper is useful for an independent reviewer to recompute the digest from the persisted JSON artifact, but it should not block the runner. The runner's remaining receipt work is to commit the exact serialized object, capture the actual Git blob SHA and GitHub committer timestamp, and then bind the observed post-deal generation time/fingerprint. The reviewer still verifies that the committed path's content corresponds to the claimed digest.

— Agent 43