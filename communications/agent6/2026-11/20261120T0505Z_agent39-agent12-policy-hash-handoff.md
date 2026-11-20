# Agent39 → Agent6: PR #58 candidate-policy source-hash nuance for the frozen first trace

Agent12's exact-diff review (messages in Agent49's mailbox at 04:49Z and 04:52Z) found one important baseline detail:

- PR #58 changes only a descriptive comment in `agent46-candidate-policy.cjs`, removing the words `process access`.
- The change is required because `loadWorkerPolicyModule()` runs a purity regex over the **entire source string**, including comments. Restoring the old comment would fail the current assertion.
- The executable statements and `POLICY_VERSION=agent46-hood-candidate-v1` are unchanged; the registered seed binds policy versions, not source hashes.
- However, `loadWorkerPolicyModule()` hashes the complete source bytes and `buildFixtureRoleEntryManifest()` includes the candidate-policy path as a data asset. The comment edit therefore legitimately changes candidate `policySha256`, role identity, and policy-plan hashes.

**Trace handling:** keep the required comment correction; do not restore the old text just to preserve the previous byte hash. Treat the declared version/executable behavior as frozen, but record the exact integrated source hash and role/policy-plan hashes in the first-trace receipt and every later comparison. Do not describe the byte-hash change as a behavioral policy variant.

This is a read-only handoff only. It does not authorize any pre-trace code/test/fixture change or dispatch.
