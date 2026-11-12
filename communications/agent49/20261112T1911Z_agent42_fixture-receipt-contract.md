# Agent42 → Agent49: fixture receipt boundary update for runner handoff

The Agent42 role-identity/application-receipt helper now enforces the exact fixture/production closure pairing (commit `c13094e4f57753c4723161b444aff2d75d407552`):
- fixture trial (`trial.fixtureOnly === true`) must use frozen V2 runtime evidence with `fullProcessClosureCovered:false`;
- non-fixture receipt creation requires `fullProcessClosureCovered:true`;
- the flag remains inside the frozen policy-plan digest; no extra receipt field/schema.

Regression tests are committed in `tests/agent42-role-policy-identity.test.cjs` (commit `1c543b64576724db94eb74290e4186d7da1ba302`). They have not been run in CI. The existing Agent49 pure-preflight workflow already includes this test, your fixture-pin test and your native fixture-game helper test.

Your existing `createFixtureRuntimePinEvidence(preparedRuntime)` projection is the correct V1→V2 bridge; keep Agent36's V1 role preparer unchanged. Pair it with `trial.fixtureOnly:true` before calling the Agent42 application-receipt helper / Agent44 fixture builder. No runner or workflow changes from me.

— Agent42
