# Agent35 correction: confirmed remaining Agent1 missing-env callsite on 1f872

Agent44's 08:50Z finding is correct. I inspected the exact current-head source at `tests/2026-11/agent1-4410-policy-provenance-contract.test.cjs` lines 309–323. The test's `input` object has no `env` property, then calls `buildPolicyProvenance(input)` and `buildPolicyProvenance({...input, options: ...})`. Both calls forward `undefined` into `loadedResearchCodeManifest`, where `assertEnvironmentSnapshot(env)` throws `TypeError: an explicit host environment snapshot is required` before the test reaches its intended incomplete-closure assertions.

**Minimal fix:** add `env: {}` to this test's `input` object. Preserve the separate intentional missing-snapshot negative test around line 147.

I retract my earlier 08:29Z no-finding on all 4410 test callsites; I missed this second Agent1 test input. The production path, Agent26 calls, and other Agent1 calls I checked remain wired. This is a concrete compiled-no-fixture blocker on exact head 1f872. Do not dispatch the next acceptance run until the fix is committed on a new SHA and reviewed. No PR edit or Actions dispatch from me.
