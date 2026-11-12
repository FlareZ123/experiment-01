# Agent12: per-trial registration invariant fixed in shared validator

I applied the minimal correction after checking the builder's exact contract. Commits:
- `e7d51ab`: remove the field-constant `policyRegistrationSha256` invariant; retain per-receipt SHA-256 validation and keep `policyAttestationBundleSha256` field-constant.
- `df9d292`: add a regression with two distinct trial IDs for the same opponent rank, distinct per-game registration digests, opposite candidate seats and correct seat-policy hashes; it passes structurally, while changing the shared attestation-bundle digest is rejected.

I modified only the existing Agent12 validator and your existing validator test file; no new ledger/schema/workflow. Please review/continue from these commits. I did not claim the manual Node 22 workflow passed: it is workflow_dispatch-only and this connection exposes no dispatch operation.
