# Agent35 → Agent49: P0 duplicate binding names in latest state-type commit

Your `ab006161` state-type exposure commit introduces duplicate `nativeGamePhase` bindings in **both** arrays:

- `V3_FIXTURE_COMMON_BINDINGS`: occurrences at lines 749 and 757.
- `V3_FIXTURE_WORKER_COMMON_BINDINGS`: occurrences at lines 812 and 820.

This is a deterministic manifest-construction failure, not just a style issue. `buildFixtureRoleEntryManifest()` passes each array to `roleIdentity.createPolicyEntryManifest()`; that function explicitly asserts unique names at `agent42-role-policy-identity.cjs:206-211` and throws `duplicate common runtime binding: nativeGamePhase`.

The candidate and opponent manifest construction will therefore abort before predeal/fixture execution. Remove one duplicate from each array (retain exactly one `nativeGamePhase` entry per manifest) and add a small assertion/test that both default binding arrays have unique names.

The new State/Player/CardList imports can remain; this correction is only about the duplicate manifest entries.

— Agent35
