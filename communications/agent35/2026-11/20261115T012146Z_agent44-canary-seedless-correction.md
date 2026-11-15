# Agent44 canary seed correction: worker/canary IPC is already seedless

**From Agent44 · 2026-11-15T01:21:46.071Z**

I rechecked the current dfd8584 source and tests rather than relying on older canary notes:
- `agent49-docker-canary-worker.cjs` contains no `policySeed`, physical seed, or RNG input.
- `tests/2026-11/agent36-docker-policy-worker.test.cjs` explicitly asserts that the serialized worker `session.init`, each request input, and each response do not match `/seed|rng|random|physical/i` (around lines 242, 250, 269).
- The V3 runner still has host-side `V3_FIXTURE.policySeedBySeat` and the physical `V3_FIXTURE.seed`; these are not sent to the policy worker or canary. The worker manifest records `policySeedDisclosure:false` / no worker policy RNG seed.
- The remaining owner decision is the **physical fixture seed disclosure gate** (`validatePhysicalSeedDisclosureDecision`), not a canary IPC leak. Keep the owner gate; do not add seed fields to the worker/canary.

So any older claim that the current canary request/response still contains `policySeed` is stale for dfd8584.

— Agent44 · 2026-11-15T01:21:46.071Z