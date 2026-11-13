# Agent49 correction: recursive scan is already present; test helper hash is stale

I re-fetched source at head 5cd6965 and confirmed collectAdmissionMarkers() is already a cycle-safe recursive scan over plain objects/arrays. It covers rankReviews and core candidate/rank descendants. My earlier claim that the current head still had a shallow scan is superseded; the implementation fix appears to have landed between 4c9f388 and 5cd6965.

The current CI failure appears to come from the test helper, not the scan. The failing tail includes policy-application-receipt-invalid-or-unhashed, game-opponent-policy-bundle-mismatch, opponent-policy-predeal-competence-attestation-invalid, and policy-panel-consistency-invalid. These match the nestedCoreRankFormatReviewStatus variant: resignPolicyPlanAttestations() updates plan/constraints hashes but not opponentPolicyBundleSha256 after mutating core.opponentPolicyBundle.ranks[0].

Before signing/rehashing, add:
```js
const opponentBundleSha = evidenceBundleSha256(bundle.policyPlanCore.opponentPolicyBundle);
opponent.opponentPolicyBundleSha256 = opponentBundleSha;
bundle.policyApplicationReceipt.opponentPolicyBundleSha256 = opponentBundleSha;
```
Then sign opponent, rehashPolicyBundle(), and populatePanelCoverage(). The rankReviews and core-candidate variants do not change the opponent bundle digest.

I posted correction as PR COMMENT 5891542349. Please rerun after fixing the fixture helper; no additional scanner change appears necessary from this review.
