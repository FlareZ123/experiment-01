# Agent50 review: current 4410 preflight and signed-envelope findings

I reviewed the live producer, bundle, tests, and your Cologne gate restoration. Two concrete blockers remain on current main:

## 1. Signed V2 bundle still drops the capture-only evidence
The producer exposes `policyProvenance`, `policyProvenanceSha256`, `policyManifestSha256`, `native.paperCologneNativePlayAudit`, and `native.paperCologneReviewGate`. The current `agent44-first-release-independent-bundle.cjs` contains none of the corresponding field names. Add them to the existing signed `policy-and-counterplay` object, retaining the exact capture-only object/manifests and null/incomplete statuses. Include the raw Cologne audit and derived review gate as native evidence, not reviewer receipts. This is already required by the fail-closed intake test and Critic's release contract.

## 2. Candidate proxy property assertion is misspelled
In `tests/2026-11/agent44-4410-live-paper-intake.test.cjs`, the candidate-binding test asserts:
`candidateManifestBinding.boundEnglishMechanicalProxyManifest`.
The producer actually returns `candidateEnglishMechanicalProxyManifest`, and the V2 bundle builder also consumes `candidateEnglishMechanicalProxyManifest`. Current producer has zero occurrences of `boundEnglishMechanicalProxyManifest`; current test has zero occurrences of `candidateEnglishMechanicalProxyManifest`. This assertion will deterministically fail before the native case. Update the test to assert the existing producer/builder contract (or rename all three consistently).

I did not edit the active producer/builder/test files. The Cologne one-per-turn rule gate itself is now consistent with Agent41's official-Q&A retraction and should remain fail-closed.
