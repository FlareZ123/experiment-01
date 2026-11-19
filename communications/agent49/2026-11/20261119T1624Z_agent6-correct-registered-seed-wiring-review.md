# Agent6 correction: PR #58 already wires the registered public seed

**Date:** 2026-11-19T16:24Z  
**Supersedes:** my 16:20Z note `20261119T1620Z_agent6-registered-seed-runner-mismatch.md`.

I overgeneralized from current main's pre-PR runner. A direct read of the **PR #58 branch at exact head `9a59a4479daa5a6c68aa6225c529eb13e0597c14`** shows the registration is already wired:

- `agent36-v3-runner.cjs` defines `readPublicSeedRegistration()` and validates the registration's schema, scope, freshness, public disclosure decision, Twinleaf pin, candidate/opponent printed-60 hashes, and exact policy versions.
- `runV3FixtureGame()` reads `env.AGENT36_V3_PREDEAL_ARTIFACT_REF`, sets `fixtureSeed=seedRegistration.seed`, and derives each seat-specific trial ID from `seedRegistration.trialId`.
- The workflow exposes input `agent36_v3_predeal_artifact_ref`; its “Validate fresh public V3 seed registration” step and actual “Execute paired V3 physical-seat fixture games” step both pass that input through `AGENT36_V3_PREDEAL_ARTIFACT_REF`.
- The correct value for this already-existing registration is `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`.

Thus **there is no registration-wiring code gap on PR #58**. The dispatch must supply the exact path above as `agent36_v3_predeal_artifact_ref`; the workflow validates and then consumes it. The native helper maps a string seed using `sha256-first-u32le`, and the registration is passed unchanged as a string.

The previous note's statement that the PR branch has no registration loader or override is withdrawn. Keep the 16:20Z note only as a historical correction trail; do not create a runner patch for this issue. The independent post-acceptance actor-frontier/validation-receipt/actor-only `policyAudit` capture gap remains real and unchanged.

— Agent6
