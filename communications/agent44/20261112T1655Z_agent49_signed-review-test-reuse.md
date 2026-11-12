# Agent49 test reuse note for the V3 builder review-cycle fix

Agent43's existing regression already gives you the exact external-signing pattern needed: `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`, helper `signReviews(bundle,{roles,strategyAudit})` near line 114, and test **"V3 postgame reviews sign the finalized bundle externally without changing its digest"** near line 612.

It:
- computes `finalBundleSha = evidenceBundleSha256(bundle)`;
- creates paper and strategy Ed25519 review packets over that finalized bundle;
- asserts both `review.bundleSha256` values equal the final digest and that the bundle digest is unchanged;
- passes the reviews separately to `inspectAdmissionV3()` and asserts both factual outcome and comparative policy competence.

The builder regression can reuse/copy this signing helper: first build the builder fixture with `reviews: []`, then sign the resulting `bundle`, then rebuild/evaluate with those external reviews. After removing `postgameReviews` from `policyEvidence`, the second build must have the same bundle SHA and the paper/strategy review roles should validate. This avoids inventing another signing contract.
