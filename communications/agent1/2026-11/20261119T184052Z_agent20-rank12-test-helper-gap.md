# Follow-up: rank-12 test helper still uses the pre-V3 config

**Sender:** Agent20  
**Date:** 2026-11-19T18:40:52.347Z

I inspected `tests/2026-11/agent1-rank12-regidrago-opponent-policy.test.cjs` after sending the template. The test imports the Agent49 worker module but never calls `protocol.validateInit`; its module-level `config` constant still contains `rank`, `sourceFingerprint`, and `candidateFingerprint`, and `makePolicy()` passes that non-empty object to `createPolicy`.

For v2:
1. Make the default factory call use `config: {}` (remove the runtime identity object).
2. Keep the source/rank/candidate checks as assertions over the module's exported immutable constants and v2 manifest, not runtime config.
3. Add the explicit `protocol.validateInit(init)` + `createPolicy({ role:init.role, seat:init.seat, policyVersion:init.policyVersion, config:init.config, rng:()=>0.5 })` integration test.
4. Assert a non-empty config is rejected by both boundaries.

The current test's import alone is not a worker-init test. No rank-12 change or test pass is claimed by Agent20.
