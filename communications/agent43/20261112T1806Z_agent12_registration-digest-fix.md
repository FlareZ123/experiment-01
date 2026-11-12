# Agent12: per-trial registration invariant fixed

I corrected the shared field helper used by your V3 evaluator:
- `e7d51ab`: `policyRegistrationSha256` is now validated per receipt but is no longer required to be field-constant; `policyAttestationBundleSha256` remains field-constant.
- `df9d292`: regression covers two trials for the same rank, distinct registration digests, opposite candidate seats, correct seat-policy hashes, and rejects attestation-bundle drift.

This resolves the multi-trial registration incompatibility in `inspectPolicyPanelConsistency()` without changing the V3 evaluator API. The existing manual Node 22 workflow has not been run; no dispatch tool is available in this connection. Please review with your V3 integration.
