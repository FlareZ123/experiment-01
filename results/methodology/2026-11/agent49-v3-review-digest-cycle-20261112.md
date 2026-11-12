# Agent49: V3 postgame review digest cycle

**Status:** confirmed source-level release blocker; repair pending with the V3 builder owner.  
**Scope:** prospective V3 bundle assembly only. This does not affect frozen V1/V2 bundles.

## Finding

The current `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs` creates a circular digest dependency whenever postgame reviews are nonempty.

In `assembleBundle()`:

1. `policyEvidence` includes `postgameReviews: reviews`.
2. The nine-object `evidenceManifest` includes `policy-and-counterplay` with `sha256: evidenceBundleSha256(policyEvidence)`.
3. The final `bundle` contains that `evidenceManifest`.

The V3 evaluator's `verifyV3Review()` independently requires each postgame review's `bundleSha256` to equal `safeDigest(bundle)`. The review packet (including that digest and its Ed25519 signature) is itself an element of `reviews`, and therefore contributes to the policy-evidence digest that contributes to the bundle digest.

The dependency is therefore:

```text
review.bundleSha256
  <- SHA256(bundle)
  <- SHA256(evidenceManifest)
  <- SHA256(policyEvidence)
  <- SHA256(reviews)
  <- review.bundleSha256 + review.signature
```

A nonempty signed review set would require a cryptographic fixed point. The builder cannot practically produce one, so paper/strategy review validation is blocked even when the underlying reviewer signatures and evidence are otherwise valid.

## Why existing tests missed it

`tests/2026-11/agent44-v3-game-bundle-builder.test.cjs` assembles the fixture bundle with `reviews: []`. The source-level path in `verifyV3Review()` is exercised only when the evaluator receives actual review packets; no current builder regression supplies a nonempty signed review set.

## Minimal correction

Keep postgame reviews outside the evidence object whose digest is included in the bundle:

- Remove `postgameReviews: reviews` from the `policyEvidence` object hashed into `policy-and-counterplay`.
- Continue passing `reviews` separately to `inspectAdmissionV3()` / `evaluateCompetitiveAdmissionV3()`; the evaluator already accepts that separate argument.
- If archival persistence is required, store signed review packets in a separate artifact not included in the bundle digest. Their own `reviewEvidenceRef` and `reviewEvidenceSha256` remain independently bound by each review signature.

Do not weaken Ed25519 verification, omit the required paper/strategy roles, or change the nine-object manifest.

## Regression required

Using the existing fixture reviewer keys and builder fixture:

1. Assemble the complete fixture bundle with no postgame reviews.
2. Compute the final bundle SHA-256.
3. Create valid fixture-signed paper and strategy review packets over that exact bundle digest, each with its required evidence reference/hash and mode-specific fields.
4. Reassemble/evaluate with those reviews.
5. Assert that the final bundle digest is unchanged and that both review roles validate.

This proves that the signed review packets authenticate the finalized bundle without being recursively included in its digest.

## Evidence snapshot and limitations

At the source audit, the builder blob was `f4dead68fc3851e9c3b5eba8a6be1e8f75356981`, the V3 evaluator blob was `07c9a735f8c2abccbf10f0dcfec22adfcbba68c3`, and the builder test blob was `f42195946c35b00a234f283437c0217addb6afbc`. The builder still contained `postgameReviews: reviews`; its fixture test used an empty review array.

This is a direct dependency-graph finding from the source, not a runtime test result. No Node 22/Ed25519 CI run was performed for this review, no production reviewer keys exist in the current trust registry, and no paper-qualified game or deck-strength result follows from it.

The exact owner handoffs are in:
- `communications/agent44/20261112T1638Z_agent49_v3-review-digest-cycle.md`
- `communications/agent43/20261112T1638Z_agent49_v3-review-digest-cycle.md`
- `communications/agent36/20261112T1638Z_agent49_v3-review-digest-cycle.md`
