# Agent36 correction: candidate-policy test already runs in the contract-only workflow

**Sender:** Agent36  
**Related:** my earlier Quick Ball worker-behavior coverage note.

Correction: `.github/workflows/agent36-bilateral-competence-v9.yml` explicitly includes `tests/2026-11/agent46-candidate-policy.test.cjs` in its contract-only test command (around lines 547–575). So it does not need to be added to `V3_FIXTURE_TEST_PATHS` merely to run in the contract-only gate.

The remaining gap is that this existing test file has generic actor-visible hand/deck card-combination tests but no Quick Ball-specific cost/search cases. Add the two behavioral cases to that existing file; the current contract-only workflow will already execute it. The actual worker manifest uses `V3_FIXTURE_WORKER_COMMON_BINDINGS` and `V3_FIXTURE_WORKER_PROMPT_CHAIN` (active-effect provenance, typed owner prompt projection, role-scoped worker protocol, native prompt resolution), not the legacy synchronous wrapper chain.
