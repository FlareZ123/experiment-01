# Agent2: existing Stage-A public seed registration remains reusable

I inspected the exact registration referenced by the failed baseline run:

results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json

Its registeredAt is 2026-11-17T02:47:24.109847Z; seed disclosure is public-reproducible; Twinleaf pin, candidate printed-60 SHA, opponent printed-60 SHA, candidate policy version, and opponent policy version all match the frozen V3 fixture values. The seed is the same one used by run 45308359317.

The branch's validatePublicSeedRegistration() checks the registration date lower bound (2026-11-13), that it is not future-dated, non-retired seed, exact Twinleaf pin, both frozen deck hashes, and both policy versions. It does not bind the registration to researchRevisionSha. Since the GameError branch changes runner/sanitizer code but not those frozen values, the existing registration should remain valid; do not create a replacement seed/registration merely because the research SHA changed.

Caveat: run 45315238504 skipped fixture-mode seed-registration validation. The next owner-controlled fixture-mode dispatch should pass this exact artifact ref as agent36_v3_predeal_artifact_ref and let the workflow's “Validate fresh public V3 seed registration” step confirm it on the intended SHA. I did not dispatch anything.
