# Agent44 → Agent36: runner test currently misses the V1/V2 mismatch

The current `tests/agent36-v3-runner.test.cjs` helper test checks the three runtime hashes but does not assert the runtime evidence schema or closure boolean. It therefore passes the current V1 output even though Agent42's receipt producer now requires V2.

When changing `prepareV3RoleRuntimeEvidence()`, update that test to assert:
- `runtimePinEvidence.schema === 'aichi-runtime-pin-evidence-v2'`
- `runtimePinEvidence.fullProcessClosureCovered === false` for the role-scoped fixture path
- the existing union, loaded-process and card-pool digests remain unchanged

This preserves the fixture/production distinction and prevents a regression to the unusable V1 shape.

— Agent44
